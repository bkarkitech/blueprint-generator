import { streamText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { z } from "zod";

import { getOrCreateBlueprint, saveBlueprint } from "@/lib/blueprintsStore";
import GitHubAPIClient from "@/lib/githubAPI";
import type { RequestBody } from "@/lib/types";
import { validateEnvironment } from "@/lib/env";

const MermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/i;

const isRepoAllowed = (allowed: Set<string>, owner: string, repo: string) =>
  allowed.has(`${owner}/${repo}`);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Validate required environment variables
  try {
    validateEnvironment();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Server configuration error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const body = (await req.json()) as RequestBody;
  const incomingMessages: Array<{ role: "user" | "assistant"; content: string }> =
    body?.messages ?? [];
  const incomingRepos: string[] = body?.repos ?? [];

  // Get or create blueprint with incoming repos
  const bp = getOrCreateBlueprint(id, incomingRepos.length > 0 ? incomingRepos : undefined);
  
  // If repos were provided in request, update the blueprint
  if (incomingRepos.length > 0) {
    bp.repos = incomingRepos;
  }
  
  const allowedRepos = new Set(bp.repos);

  // Update stored chat history (keep last ~60)
  bp.messages = [...bp.messages, ...incomingMessages].slice(-60);

  if (!process.env.GITHUB_TOKEN) {
    return new Response("Missing GITHUB_TOKEN", { status: 500 });
  }

  // Initialize GitHub API client
  const github = new GitHubAPIClient(process.env.GITHUB_TOKEN);

  // 3) Guarded tool wrappers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  tools.readRepoFile = {
    description:
      "Read a file from a GitHub repo in the Blueprint scope. Use for README, docs, deploy/infra config, CI, contracts.",
    parameters: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      path: z.string().describe("File path"),
      ref: z.string().optional().describe("Branch or commit SHA"), 
    }),
    execute: async (args: { owner: string; repo: string; path: string; ref?: string }) => {
      if (!isRepoAllowed(allowedRepos, args.owner, args.repo)) {
        throw new Error(`Repo not in Blueprint scope: ${args.owner}/${args.repo}`);
      }

      try {
        const file = await github.readFile(args.owner, args.repo, args.path, args.ref);

        // Save provenance (server-side)
        bp.provenance.push({
          repo: `${args.owner}/${args.repo}`,
          path: args.path,
          ref: args.ref,
          at: new Date().toISOString(),
        });
        bp.provenance = bp.provenance.slice(-200);

        saveBlueprint(bp);
        return { path: file.path, text: file.content };
      } catch (error) {
        throw new Error(
          `Failed to read ${args.path} from ${args.owner}/${args.repo}: ${error}`
        );
      }
    },
  };

  tools.listRepoTree = {
    description:
      "List files in a repo (helps locate architecture, deploy, infra, contract files). Only within Blueprint scope.",
    parameters: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      path: z.string().optional().describe("Directory path"),
      ref: z.string().optional().describe("Branch or commit SHA"),
      recursive: z.boolean().optional().describe("Recursively list all files"),
    }),
    execute: async (
      args: { owner: string; repo: string; path?: string; ref?: string; recursive?: boolean }
    ) => {
      if (!isRepoAllowed(allowedRepos, args.owner, args.repo)) {
        throw new Error(`Repo not in Blueprint scope: ${args.owner}/${args.repo}`);
      }

      try {
        const nodes = await github.listTree(
          args.owner,
          args.repo,
          args.path,
          args.ref,
          args.recursive
        );

        return {
          path: args.path || "/",
          items: nodes.slice(0, 50).map((n) => ({
            path: n.path,
            type: n.type,
            size: n.size,
          })),
          total: nodes.length,
        };
      } catch (error) {
        throw new Error(`Failed to list tree in ${args.owner}/${args.repo}: ${error}`);
      }
    },
  };

  tools.searchRepo = {
    description:
      "Search within a repo for keywords (e.g., kafka, sns, sqs, dynamodb, grpc, ingress, terraform). Only within Blueprint scope.",
    parameters: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      query: z.string().describe("Search keyword or pattern"),
    }),
    execute: async (args: { owner: string; repo: string; query: string }) => {
      if (!isRepoAllowed(allowedRepos, args.owner, args.repo)) {
        throw new Error(`Repo not in Blueprint scope: ${args.owner}/${args.repo}`);
      }

      try {
        const results = await github.searchCode(args.owner, args.repo, args.query);

        return {
          query: args.query,
          results: results.slice(0, 20),
          total: results.length,
        };
      } catch (error) {
        throw new Error(
          `Failed to search in ${args.owner}/${args.repo} for "${args.query}": ${error}`
        );
      }
    },
  };

  // 4) System prompt includes: repo scope + current diagram + provenance summary
  const currentDiagram = bp.diagramMermaid
    ? `\nCurrent Mermaid (baseline):\n\`\`\`mermaid\n${bp.diagramMermaid}\n\`\`\`\n`
    : "\nNo diagram exists yet. Create the first Mermaid diagram.\n";

  const provenanceSummary = bp.provenance.length
    ? bp.provenance
        .slice(-40)
        .map((p: any) => `- ${p.repo}:${p.path}${p.ref ? ` @${p.ref}` : ""}`)
        .join("\n")
    : "- (none yet)";

  const useMistral = process.env.USE_MISTRAL !== "false";
  
  const system = useMistral ? `
You are an expert software architect and conversational AI assistant.

Your role:
- Engage in natural conversation about the repositories and their architecture
- Answer questions about design, components, dependencies, deployment, and technical decisions
- Ask clarifying questions when needed
- Provide code examples, explanations, and insights
- Generate Mermaid diagrams when asked, but don't force them
- Reference specific files and code when available

Blueprint repositories in scope (you can analyze these):
${bp.repos.map((r: any) => `- ${r}`).join("\n")}

Guidelines:
- Be conversational and helpful, not robotic
- Use the available tools to look up specific information when asked
- Provide context from what you find in the repositories
- If you don't know something, offer to look it up using the available tools
- Feel free to ask follow-up questions to better understand the user's needs
- Generate diagrams in Mermaid format when the user requests them or when it helps explain something

Recent files already examined:
${provenanceSummary}

Remember: You're having a conversation, not just generating documents. Be natural and helpful!
` : `
You are an expert software architect and conversational AI assistant with deep knowledge of open-source and enterprise systems.

Your role:
- Engage in natural, helpful conversations about code, architecture, and software design
- Analyze repositories to understand their structure, design patterns, and technical decisions
- Answer questions about dependencies, deployment strategies, performance, scalability
- Generate Mermaid diagrams when requested or when they help clarify concepts
- Use available tools to look up specific files and information
- Have real discussions - ask clarifying questions, provide examples, explore ideas together

Blueprint repositories you can analyze:
${bp.repos.map((r: any) => `- ${r}`).join("\n")}

${currentDiagram}

Files you've already examined:
${provenanceSummary}

How to answer well:
- Be conversational and natural, not formal
- When unsure about something, offer to look it up from the code
- Cite specific files when providing evidence
- Generate Mermaid diagrams in \`\`\`mermaid blocks when helpful
- Ask follow-up questions to understand what the user really needs
- Provide practical insights and real-world context

Mermaid diagram guidelines (IMPORTANT):
- Use valid Mermaid syntax (flowchart, graph, sequenceDiagram, classDiagram, etc.)
- Keep diagram syntax simple and well-formed
- Always close brackets and quotes properly
- Use clear, concise labels for nodes
- Test that diagram syntax is valid before generating
- Valid connectors: -->, ---, -.->, .-
- Do NOT generate complex or nested diagrams with special characters

Remember: This is a conversation, not just document generation. Be helpful, curious, and engaging!
`;

  // 5) Stream result
  try {
    // Use Mistral for all requests
    const model = mistral(process.env.MISTRAL_MODEL ?? "mistral-large-latest");

    // Stream the text response
    const result = streamText({
      model,
      messages: bp.messages,
      system,
      // When the model finishes, capture the Mermaid for persistence
      async onFinish({ text }: { text: string }) {
        const match = text.match(MermaidBlockRegex);
        if (match?.[1]) {
          bp.diagramMermaid = match[1].trim();
          // store the assistant message too
          bp.messages.push({ role: "assistant", content: text });
          bp.messages = bp.messages.slice(-60);
          // Save the latest response to blueprint storage
          saveBlueprint(bp);
        } else {
          // still store assistant message even if no mermaid found
          bp.messages.push({ role: "assistant", content: text });
          bp.messages = bp.messages.slice(-60);
          // Save the latest response to blueprint storage
          saveBlueprint(bp);
        }
      },
    });

    // Return text stream using correct Vercel AI SDK method
    return result.toTextStreamResponse();
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Chat API error:", error);
    }
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate response",
        details: error.toString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

