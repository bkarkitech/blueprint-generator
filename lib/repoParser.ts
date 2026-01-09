/**
 * Parse repository input and convert to owner/repo format
 * Accepts:
 * - owner/repo (e.g., facebook/react)
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 */
export function parseRepository(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // Already in owner/repo format
  if (trimmed.includes('/') && !trimmed.includes('://') && !trimmed.includes('git@')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const [owner, repo] = parts;
      if (owner && repo && !owner.includes('.') && !repo.includes(':')) {
        return { owner: owner.trim(), repo: repo.trim() };
      }
    }
  }

  // HTTPS URL format
  if (trimmed.startsWith('https://github.com/')) {
    const urlParts = trimmed.replace('https://github.com/', '').replace('.git', '').split('/');
    if (urlParts.length >= 2) {
      return { owner: urlParts[0], repo: urlParts[1] };
    }
  }

  // SSH format
  if (trimmed.startsWith('git@github.com:')) {
    const urlParts = trimmed.replace('git@github.com:', '').replace('.git', '').split('/');
    if (urlParts.length >= 2) {
      return { owner: urlParts[0], repo: urlParts[1] };
    }
  }

  return null;
}

/**
 * Convert parsed repo to owner/repo string format
 */
export function formatRepository(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}

/**
 * Validate and normalize a repository string
 */
export function normalizeRepository(input: string): string | null {
  const parsed = parseRepository(input);
  if (!parsed) return null;
  return formatRepository(parsed.owner, parsed.repo);
}
