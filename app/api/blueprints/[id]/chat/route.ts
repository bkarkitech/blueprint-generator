import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { getOrCreateBlueprint, saveBlueprint } from "@/lib/blueprintsStore";
import GitHubAPIClient from "@/lib/githubAPI";

const MermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/i;

const isRepoAllowed = (allowed: Set<string>, owner: string, repo: string) =>
  allowed.has(`${owner}/${repo}`);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const bp = getOrCreateBlueprint(params.id);
  const allowedRepos = new Set(bp.repos);

  const body = await req.json();
  const incomingMessages: Array<{ role: "user" | "assistant"; content: string }> =
    body?.messages ?? [];

  // Update stored chat history (demo: keep last ~30)
  bp.messages = [...bp.messages, ...incomingMessages].slice(-30);

  if (!process.env.GITHUB_TOKEN) {
    return new Response("Missing GITHUB_TOKEN", { status: 500 });
  }

  // Initialize GitHub API client
  const github = new GitHubAPIClient(process.env.GITHUB_TOKEN);

  // 3) Guarded tool wrappers
  const tools: Record<string, any> = {};

  tools.readRepoFile = {
    description:
      "Read a file from a GitHub repo in the Blueprint scope. Use for README, docs, deploy/infra config, CI, contracts.",
    parameters: z.object({
      owner: z.string(),
      repo: z.string(),
      path: z.string(),
      ref: z.string().optional(), // branch or sha
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
      owner: z.string(),
      repo: z.string(),
      path: z.string().optional(),
      ref: z.string().optional(),
      recursive: z.boolean().optional(),
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
      owner: z.string(),
      repo: z.string(),
      query: z.string(),
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

  const system = `
You are Immerse Blueprints.

Goal:
- Generate and iteratively refine a Mermaid architecture diagram for the Blueprint scope.
- The diagram does NOT need a strict standard, but it MUST be grounded in evidence you read.
- You may chat to adjust layout, labels, grouping, and edges.
- If a requested change is uncertain, use tools to verify before claiming it's true.

Blueprint repo scope (ONLY these repos are allowed):
${bp.repos.map((r: any) => `- ${r}`).join("\n")}

${currentDiagram}

Known evidence already read (recent):
${provenanceSummary}

How to gather evidence (language-agnostic):
- Prefer README.md, docs/, architecture files
- Look for deploy/infra: helm/, k8s/, terraform/, serverless.yml, docker-compose.yml, Dockerfile, .github/workflows/
- Look for contracts: openapi/swagger, graphql schemas, *.proto, asyncapi, event docs
- Use listRepoTree/searchRepo/readRepoFile as needed.

Output rules:
- Always output a Mermaid diagram in a single \`\`\`mermaid block\`\`\`.
- After the diagram, include a short bullet list titled "Evidence used" listing repo/file paths you consulted this turn.
- If you inferred something without direct evidence, label it "(inferred)" next to the edge or node.
`;

  // 5) Stream result
  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4-mini"),
    messages: bp.messages,
    tools,
    system,
    // When the model finishes, capture the Mermaid for persistence
    async onFinish({ text }: { text: string }) {
      const match = text.match(MermaidBlockRegex);
      if (match?.[1]) {
        bp.diagramMermaid = match[1].trim();
        // store the assistant message too
        bp.messages.push({ role: "assistant", content: text });
        bp.messages = bp.messages.slice(-60);
        saveBlueprint(bp);
      } else {
        // still store assistant message even if no mermaid found
        bp.messages.push({ role: "assistant", content: text });
        bp.messages = bp.messages.slice(-60);
        saveBlueprint(bp);
      }
    },
  });

  return result.toAIStreamResponse();
}

