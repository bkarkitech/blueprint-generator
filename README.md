# Blueprint Generator

A stateful chat interface for generating and refining architecture diagrams using GitHub MCP (Model Context Protocol) integration with LLMs.

## Features

- **Stateful Chat**: Continuously refine Mermaid architecture diagrams through conversation
- **GitHub API Integration**: Access repository content (files, tree listings, code search)
- **No MCP Required**: Works with standard GitHub REST API + OpenAI
- **Guarded Tool Access**: Only access allowed repositories within Blueprint scope
- **Provenance Tracking**: Keep track of which files were read and when
- **Persistent State**: Blueprint diagrams, messages, and metadata are stored in-memory (can be swapped to DB)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
# GitHub Personal Access Token (classic)
# Generate at: https://github.com/settings/tokens
# Scopes: repo, read:user, read:org
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"

# OpenAI API Key
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-mini"
```

> **Note**: You'll need a GitHub PAT (Personal Access Token) and OpenAI API key. No GitHub MCP server needed!

### 3. Update Repository Scope (Optional)

The default demo uses popular open source repos (vercel/next.js, kubernetes/kubernetes, nodejs/node, etc) so you can test immediately.

When ready, edit `lib/blueprintsStore.ts` to use your own repositories:

```typescript
repos: [
  "your-org/service-a",
  "your-org/service-b",
  "your-org/web-frontend",
  // ... add your repos here
]
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to `/blueprints/demo` (or any blueprint ID)
2. Start with a prompt like: **"Show me the architecture of these projects"**
3. The LLM will:
   - Use GitHub API to read README files and architecture docs
   - Search for interesting keywords and patterns
   - Generate a Mermaid diagram based on evidence
   - Output "Evidence used" section showing which files were consulted
4. Continue the conversation:
   - "Group by category (infrastructure, application, monitoring)"
   - "What languages are used?"
   - "Add deployment patterns"

The model can verify details by reading files before updating the diagram.

## Architecture

### Backend Components

- **`lib/githubAPI.ts`**: GitHub REST API client wrapper
  - Direct calls to GitHub REST API (no MCP)
  - Methods: readFile, listTree, searchCode, getRepo, getReadme
- **`lib/blueprintsStore.ts`**: In-memory Blueprint storage (demo)
  - Stores: repos, diagram, messages, provenance
- **`app/api/blueprints/[id]/chat/route.ts`**: Chat API endpoint
  - Manages guarded tool access (readRepoFile, listRepoTree, searchRepo)
  - Extracts and persists Mermaid diagrams
  - Tracks provenance of file reads

### Frontend Components

- **`app/blueprints/[id]/page.tsx`**: Chat UI
  - Uses `@assistant-ui/react` for UI
  - Integrates with OpenAI via `@ai-sdk/openai`

## API Endpoint

### `POST /api/blueprints/:id/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Generate diagram" }
  ]
}
```

**Response**: Streaming response with chat completions and Mermaid diagrams

## Tools Available to the LLM

1. **readRepoFile**: Read individual files from allowed repos
   - Parameters: `owner`, `repo`, `path`, `ref` (optional)
   - Guarded: only within Blueprint scope
   - Returns: file content as string

2. **listRepoTree**: List files/folders in a repo
   - Parameters: `owner`, `repo`, `path` (optional), `recursive` (optional)
   - Guarded: only within Blueprint scope
   - Returns: list of files with type and size info

3. **searchRepo**: Search for keywords in a repo
   - Parameters: `owner`, `repo`, `query`
   - Guarded: only within Blueprint scope
   - Returns: matching file paths (GitHub REST API search)

## Future Improvements

- [ ] Persist to real database (versioned diagrams, attestations)
- [ ] Add diff viewer for old vs new diagrams
- [ ] Rate limiting and tenant authentication
- [ ] Attestation snapshots: `POST /api/blueprints/:id/attest`
- [ ] Context pack phase for better diagram quality
- [ ] Support for more MCP providers (not just GitHub)

## License

ISC
