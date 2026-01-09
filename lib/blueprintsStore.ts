export type Blueprint = {
  id: string;
  repos: string[]; // ["org/repo", ...]
  diagramMermaid: string | null;
  provenance: Array<{
    repo: string; // "org/repo"
    path: string; // "README.md"
    ref?: string; // optional sha/branch
    at: string; // ISO
  }>;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};

const store = new Map<string, Blueprint>();

export const getOrCreateBlueprint = (id: string) => {
  const existing = store.get(id);
  if (existing) return existing;

  // Demo scope: Public example repos for testing
  // Replace with your own repos when ready
  const bp: Blueprint = {
    id,
    repos: [
      // Popular backend services
      "vercel/next.js",           // Web framework
      "nodejs/node",              // Runtime
      "kubernetes/kubernetes",    // Orchestration
      "prometheus/prometheus",    // Monitoring
      "elastic/elasticsearch",    // Search/analytics
      "hashicorp/terraform",      // Infrastructure as code
      "docker/cli",               // Container platform
      "etcd-io/etcd",             // Distributed consensus
      "grpc/grpc",                // RPC framework
      "apache/kafka",             // Message broker
    ],
    diagramMermaid: null,
    provenance: [],
    messages: [],
  };

  store.set(id, bp);
  return bp;
};

export const saveBlueprint = (bp: Blueprint) => store.set(bp.id, bp);
