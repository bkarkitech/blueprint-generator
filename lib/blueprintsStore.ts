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

export const getOrCreateBlueprint = (id: string, initialRepos?: string[]) => {
  const existing = store.get(id);
  if (existing) return existing;

  const bp: Blueprint = {
    id,
    repos: initialRepos && initialRepos.length > 0 ? initialRepos : [],
    diagramMermaid: null,
    provenance: [],
    messages: [],
  };

  store.set(id, bp);
  return bp;
};

export const saveBlueprint = (bp: Blueprint) => store.set(bp.id, bp);
