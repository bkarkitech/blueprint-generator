# Migration from MCP to GitHub API

## Summary of Changes

Since your enterprise doesn't support MCP servers, I've updated the Blueprint Generator to use **direct GitHub REST API calls** instead.

### What Changed

#### Removed ❌
- `@modelcontextprotocol/sdk` dependency
- MCP server connections via `StreamableHTTPClientTransport`
- `experimental_createMCPClient` API usage
- `GITHUB_MCP_URL` and `GITHUB_MCP_TOKEN` environment variables

#### Added ✅
- **`lib/githubAPI.ts`**: Custom GitHub API client with methods:
  - `readFile(owner, repo, path, ref)` - Read file content
  - `listTree(owner, repo, path, recursive)` - List files/folders
  - `searchCode(owner, repo, query)` - Search repository
  - `getRepo(owner, repo)` - Get repo metadata
  - `getReadme(owner, repo)` - Get README content

#### Updated ✅
- **`app/api/blueprints/[id]/chat/route.ts`**: Refactored to use GitHub API client
- **`.env.local`**: Changed to use `GITHUB_TOKEN` instead of `GITHUB_MCP_TOKEN`
- **Documentation**: Updated README and QUICKSTART guides

## How to Use

### 1. Get a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `blueprint-generator`
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `read:user` (read user profile data)
   - ✅ `read:org` (read organization info)
5. Click "Generate token"
6. **Copy immediately** (you won't see it again!)

### 2. Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and add your tokens:
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
OPENAI_MODEL="gpt-4-mini"
```

### 3. Update Repositories

Edit `lib/blueprintsStore.ts` and update the `repos` array:

```typescript
repos: [
  "your-org/repo-1",
  "your-org/repo-2",
  // ... your actual repos
]
```

## How It Works

1. **Frontend** sends messages to `/api/blueprints/:id/chat`
2. **Backend** receives message and initializes GitHub API client
3. **LLM** gets access to three guarded tools:
   - `readRepoFile` - reads files (must be in allowed repos)
   - `listRepoTree` - lists files (must be in allowed repos)
   - `searchRepo` - searches code (must be in allowed repos)
4. **LLM** calls tools as needed to gather evidence
5. **LLM** generates Mermaid diagram
6. **Backend** extracts diagram and persists with provenance

## Advantages over MCP

✅ **No server dependency** - uses standard GitHub REST API
✅ **Better for enterprise** - works with standard GitHub PATs
✅ **Simpler setup** - no MCP server to configure
✅ **Standard auth** - GitHub PAT is widely understood
✅ **Lower latency** - direct API calls vs MCP layer

## File Changes

```
app/
  api/
    blueprints/[id]/
      chat/
        route.ts  (refactored to use GitHub API)
  
lib/
  githubAPI.ts  (new - GitHub API client)
  blueprintsStore.ts (unchanged)

.env.local (updated - use GITHUB_TOKEN instead of GITHUB_MCP_TOKEN)
.env.local.example (updated)
README.md (updated documentation)
QUICKSTART.md (updated)
```

## Testing

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000 → "Demo Blueprint"
3. Try: "Generate a Mermaid diagram for these repos"
4. Check the server logs to see API calls

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing GITHUB_TOKEN" | Add GITHUB_TOKEN to .env.local |
| "Repo not in Blueprint scope" | Check spelling in lib/blueprintsStore.ts |
| "Failed to read file" | Verify token has access to repo |
| "403 Unauthorized" | Token may have expired or insufficient scopes |

---

For more details, see [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md)
