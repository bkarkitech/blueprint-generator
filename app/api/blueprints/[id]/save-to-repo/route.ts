import { getOrCreateBlueprint } from "@/lib/blueprintsStore";
import GitHubAPIClient from "@/lib/githubAPI";
import { validateEnvironment } from "@/lib/env";

export interface SaveToRepoRequest {
  repoUrl: string; // e.g., "https://github.com/owner/repo" or "owner/repo"
  path?: string; // e.g., "docs" or "api/docs"
  filename?: string; // e.g., "blueprint.md" or use "blueprint-{id}.md" as default
}

export interface SaveToRepoResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
  sha?: string;
}

function parseRepoUrl(
  repoUrl: string
): { owner: string; repo: string } | null {
  // Handle both "owner/repo" and "https://github.com/owner/repo" formats
  let match = repoUrl.match(/^([^/]+)\/([^/]+)$/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }

  match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }

  return null;
}

function normalizePath(path: string): string {
  // Remove leading/trailing slashes and normalize
  return path.replace(/^\/+|\/+$/g, "").trim();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate environment
    validateEnvironment();

    if (!process.env.GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "GitHub token not configured",
        } as SaveToRepoResponse),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as SaveToRepoRequest;

    // Validate input
    if (!body.repoUrl || body.repoUrl.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Repository URL is required",
        } as SaveToRepoResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse repo URL
    const repoInfo = parseRepoUrl(body.repoUrl);
    if (!repoInfo) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Invalid repository URL format. Use 'owner/repo' or 'https://github.com/owner/repo'",
        } as SaveToRepoResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get blueprint
    const bp = getOrCreateBlueprint(id);

    // Prepare filename
    const filename = body.filename?.trim() || `blueprint-${id}.md`;

    // Prepare file path
    let filePath = filename;
    if (body.path?.trim()) {
      const normalizedPath = normalizePath(body.path);
      filePath = `${normalizedPath}/${filename}`;
    }

    // Build markdown content from blueprint
    const content = buildMarkdownContent(bp, id);

    // Initialize GitHub API client
    const github = new GitHubAPIClient(process.env.GITHUB_TOKEN);

    const tokenDebug = process.env.GITHUB_TOKEN
      ? `Token length: ${process.env.GITHUB_TOKEN.length}, starts with: ${process.env.GITHUB_TOKEN.substring(0, 4)}...`
      : "No token found";

    console.log(`GitHub token info:`, tokenDebug);
    console.log(`Attempting to save blueprint to GitHub:`, {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: filePath,
      contentLength: content.length,
    });

    // Try to write file
    const result = await github.writeFile(
      repoInfo.owner,
      repoInfo.repo,
      filePath,
      content,
      `Save blueprint: ${id}`,
      "main"
    );

    console.log(`Successfully saved blueprint to GitHub:`, {
      sha: result.sha,
      path: result.path,
    });

    const fileUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/main/${filePath}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Blueprint saved to ${repoInfo.owner}/${repoInfo.repo} at ${filePath}`,
        fileUrl,
        sha: result.sha,
      } as SaveToRepoResponse),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Save to repo error:", error);

    let message = "Failed to save blueprint";
    let statusCode = 400;
    
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("404")) {
      message = "Repository not found. Check that owner/repo exists and is accessible.";
    } else if (errorMsg.includes("401")) {
      message = "Unauthorized: Invalid GitHub token. Regenerate your token at https://github.com/settings/tokens";
      statusCode = 401;
    } else if (errorMsg.includes("403")) {
      message = "Permission denied: You don't have write access to this repository. Ensure your token has 'repo' scope.";
      statusCode = 403;
    } else if (errorMsg.includes("422")) {
      message = "Invalid request: The file path or content may be invalid.";
    } else if (errorMsg.includes("token")) {
      message = "Authentication failed: Check that GITHUB_TOKEN is configured correctly in .env.local";
      statusCode = 401;
    }

    return new Response(
      JSON.stringify({
        success: false,
        message,
      } as SaveToRepoResponse),
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Build markdown content from blueprint
 */
function buildMarkdownContent(
  bp: any,
  blueprintId: string
): string {
  const timestamp = new Date().toISOString();
  const reposSection = bp.repos?.length
    ? `## Analyzed Repositories\n\n${bp.repos.map((r: string) => `- ${r}`).join("\n")}\n\n`
    : "";

  const messagesSection =
    bp.messages?.length > 0
      ? `## Conversation History\n\n${bp.messages
          .map((m: any) => `**${m.role}**: ${m.content}\n`)
          .join("\n")}\n\n`
      : "";

  const diagramSection = bp.diagramMermaid
    ? `## Architecture Diagram\n\n\`\`\`mermaid\n${bp.diagramMermaid}\n\`\`\`\n\n`
    : "";

  return `# Blueprint: ${blueprintId}

Generated on: ${timestamp}

${reposSection}${messagesSection}${diagramSection}## Provenance

${
  bp.provenance?.length
    ? bp.provenance
        .map((p: any) => `- **${p.repo}** - ${p.path} (${p.at})`)
        .join("\n")
    : "No provenance data"
}
`;
}
