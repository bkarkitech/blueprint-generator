import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { mistral } from "@ai-sdk/mistral";
import { z } from "zod";

import { getOrCreateBlueprint, saveBlueprint } from "@/lib/blueprintsStore";
import GitHubAPIClient from "@/lib/githubAPI";

const MermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/i;

const isRepoAllowed = (allowed: Set<string>, owner: string, repo: string) =>
  allowed.has(`${owner}/${repo}`);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const body = (await req.json()) as { messages?: Array<{ role: "user" | "assistant"; content: string }>; repos?: string[] };
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

Remember: This is a conversation, not just document generation. Be helpful, curious, and engaging!
`;

  // Demo mode: return mock response for testing without API
  if (process.env.DEMO_MODE === "true") {
    const demoResponse = `## Architecture Analysis

I've analyzed the repositories in scope and generated a modern microservices architecture diagram:

\`\`\`mermaid
graph TB
    subgraph Client Layer
        Web["🌐 Web Client"]
        Mobile["📱 Mobile App"]
    end
    
    subgraph API Layer
        LB["⚖️ Load Balancer"]
        API["🔌 API Gateway"]
    end
    
    subgraph Service Layer
        Auth["🔐 Auth Service"]
        Core["⚙️ Core Business Logic"]
        Search["🔍 Search Service"]
    end
    
    subgraph Data Layer
        DB[(🗄️ PostgreSQL)]
        Cache["⚡ Redis Cache"]
        ES["🔎 Elasticsearch"]
    end
    
    subgraph Async Processing
        Queue["📨 Message Queue<br/>Kafka"]
        Worker["👷 Worker Services"]
    end
    
    subgraph Infrastructure
        K8s["☸️ Kubernetes"]
        Monitor["📊 Prometheus"]
        Logs["📝 ELK Stack"]
    end
    
    Web -->|HTTPS| LB
    Mobile -->|HTTPS| LB
    LB -->|Routes| API
    API -->|Authenticate| Auth
    API -->|Routes| Core
    API -->|Routes| Search
    
    Auth -->|Verify| DB
    Core -->|Read/Write| DB
    Core -->|Cache| Cache
    Search -->|Index| ES
    
    Core -->|Publish Events| Queue
    Search -->|Publish Events| Queue
    Queue -->|Consume| Worker
    Worker -->|Update DB| DB
    
    K8s -.->|Orchestrates| API
    K8s -.->|Orchestrates| Core
    Monitor -.->|Metrics| API
    Logs -.->|Logs| API

    style Web fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style API fill:#fff3e0
    style LB fill:#fff3e0
    style Auth fill:#f3e5f5
    style Core fill:#f3e5f5
    style Search fill:#f3e5f5
    style DB fill:#e8f5e9
    style Cache fill:#e8f5e9
    style ES fill:#e8f5e9
    style Queue fill:#fce4ec
    style Worker fill:#fce4ec
    style K8s fill:#f1f8e9
    style Monitor fill:#f1f8e9
    style Logs fill:#f1f8e9
\`\`\`

### Key Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Gateway** | Next.js / Node.js | Routes requests, handles authentication |
| **Auth Service** | Node.js | JWT validation, OAuth integration |
| **Core Services** | Node.js + gRPC | Business logic, computation |
| **Database** | PostgreSQL | Persistent data storage |
| **Cache Layer** | Redis | Performance optimization |
| **Search** | Elasticsearch | Full-text search capability |
| **Message Queue** | Kafka | Async event processing |
| **Orchestration** | Kubernetes | Container orchestration, scaling |
| **Monitoring** | Prometheus + Grafana | Performance monitoring |

### Data Flow

1. **Synchronous**: Web/Mobile → Load Balancer → API Gateway → Services → Database
2. **Asynchronous**: Services → Kafka → Workers → Database
3. **Caching**: Services use Redis for frequently accessed data
4. **Search**: Elasticsearch indexes data for fast retrieval

### Infrastructure

- **Container Platform**: Docker
- **Orchestration**: Kubernetes (kubectl, helm)
- **IaC**: Terraform for infrastructure management
- **Monitoring**: Prometheus + Grafana
- **Distributed Consensus**: etcd (Kubernetes backend)
- **RPC Communication**: gRPC between services

---

**Evidence used:**
- \`vercel/next.js\` - Modern web framework
- \`nodejs/node\` - Runtime for services
- \`kubernetes/kubernetes\` - Container orchestration
- \`prometheus/prometheus\` - Metrics and monitoring
- \`elastic/elasticsearch\` - Search and analytics
- \`hashicorp/terraform\` - Infrastructure as code
- \`docker/cli\` - Containerization
- \`etcd-io/etcd\` - Distributed coordination
- \`grpc/grpc\` - Service communication
- \`apache/kafka\` - Message streaming

**Note:** This is a demo response showing typical patterns. For analysis of specific repositories, add a valid OpenAI API key and set \`DEMO_MODE=false\` in \`.env.local\`.`;

    // Save to blueprint
    const match = demoResponse.match(MermaidBlockRegex);
    if (match?.[1]) {
      bp.diagramMermaid = match[1].trim();
    }
    bp.messages.push({ role: "assistant", content: demoResponse });
    bp.messages = bp.messages.slice(-60);
    saveBlueprint(bp);

    // Return as stream
    return new Response(demoResponse, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // 5) Stream result
  try {
    // Use Mistral (free) by default, fall back to OpenAI if configured
    const useMistral = process.env.USE_MISTRAL !== "false";
    const model = useMistral
      ? mistral(process.env.MISTRAL_MODEL ?? "mistral-large-latest")
      : openai(process.env.OPENAI_MODEL ?? "gpt-4-mini");

    // For Mistral, disable tools due to API incompatibility
    // Just use the model with the system prompt
    const result = streamText({
      model,
      messages: bp.messages,
      ...(useMistral ? {} : { tools }), // Only use tools with OpenAI
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

    // Return text stream using correct Vercel AI SDK method
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate response",
        details: error.toString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

