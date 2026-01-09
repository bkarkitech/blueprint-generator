/**
 * GitHub API client for direct API calls
 * No MCP dependency - uses standard GitHub REST API + GraphQL
 */

const GITHUB_API_BASE = "https://api.github.com";

export type GitHubFile = {
  path: string;
  content: string;
  encoding: string;
};

export type GitHubTreeNode = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
  size?: number;
};

class GitHubAPIClient {
  private token: string;
  private baseUrl: string;

  constructor(token: string, baseUrl: string = GITHUB_API_BASE) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `token ${this.token}`,
      "Accept": "application/vnd.github.v3+json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error ${response.status}: ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  /**
   * Read file content from a repo
   */
  async readFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubFile> {
    const refParam = ref ? `?ref=${ref}` : "";
    const data = await this.request(
      `/repos/${owner}/${repo}/contents/${path}${refParam}`
    );

    if (data.type !== "file") {
      throw new Error(`${path} is not a file`);
    }

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path: data.path,
      content,
      encoding: data.encoding,
    };
  }

  /**
   * List files/folders in a repo
   */
  async listTree(
    owner: string,
    repo: string,
    path: string = "",
    ref?: string,
    recursive: boolean = false
  ): Promise<GitHubTreeNode[]> {
    let sha = ref || "HEAD";

    // Get the tree SHA for the commit
    if (!ref || ref === "HEAD") {
      const refData = await this.request(
        `/repos/${owner}/${repo}/git/ref/heads/main`
      ).catch(() =>
        // Fallback to master if main doesn't exist
        this.request(`/repos/${owner}/${repo}/git/ref/heads/master`)
      );
      sha = refData.object.sha;
    }

    const recursiveParam = recursive ? "?recursive=1" : "";
    const data = await this.request(
      `/repos/${owner}/${repo}/git/trees/${sha}${recursiveParam}`
    );

    // Filter by path if provided
    let nodes: GitHubTreeNode[] = data.tree || [];
    if (path) {
      const pathPrefix = path.endsWith("/") ? path : `${path}/`;
      nodes = nodes.filter((n) => n.path.startsWith(pathPrefix));
    }

    return nodes;
  }

  /**
   * Search code in a repo
   */
  async searchCode(
    owner: string,
    repo: string,
    query: string,
    limit: number = 10
  ): Promise<Array<{ path: string; matches: number }>> {
    const searchQuery = `${query} repo:${owner}/${repo}`;
    const data = await this.request(
      `/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${limit}`
    );

    return (data.items || []).map((item: any) => ({
      path: item.path,
      matches: item.name ? 1 : 0,
    }));
  }

  /**
   * Get repository metadata
   */
  async getRepo(owner: string, repo: string): Promise<any> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  /**
   * Get README content
   */
  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const file = await this.readFile(owner, repo, "README.md");
      return file.content;
    } catch {
      // Try README.txt or other variants
      try {
        const file = await this.readFile(owner, repo, "README");
        return file.content;
      } catch {
        return null;
      }
    }
  }
}

export default GitHubAPIClient;
