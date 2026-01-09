# ✅ Blueprint Generator - Migration Complete

## What You Now Have

A **Next.js blueprint generator** that generates and refines Mermaid architecture diagrams using:
- ✅ **GitHub REST API** (no MCP required)
- ✅ **OpenAI LLM** for diagram generation
- ✅ **Stateful chat** for iterative refinement
- ✅ **Enterprise-friendly** setup

---

## 🚀 Quick Start

### 1. Get Your Tokens

**GitHub Token:**
- Go: https://github.com/settings/tokens
- Create token (classic) with scopes: `repo`, `read:user`, `read:org`
- Copy the token

**OpenAI Key:**
- Go: https://platform.openai.com/api-keys  
- Create new secret key
- Copy the key

### 2. Configure

```bash
# Edit .env.local
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
```

### 3. Update Repos

Edit `lib/blueprintsStore.ts` and add your repos:

```typescript
repos: [
  "your-org/repo-1",
  "your-org/repo-2",
  "your-org/repo-3",
]
```

### 4. Start Dev Server

```bash
npm run dev
```

Open: http://localhost:3000 → "Demo Blueprint"

---

## 📁 Project Structure

```
blueprint-generator/
├── app/
│   ├── api/
│   │   └── blueprints/[id]/
│   │       └── chat/
│   │           └── route.ts          ← Chat API endpoint
│   ├── blueprints/[id]/
│   │   └── page.tsx                 ← Chat UI
│   ├── page.tsx                     ← Home
│   └── layout.tsx                   ← Root layout
│
├── lib/
│   ├── githubAPI.ts                 ← GitHub API client (NEW!)
│   └── blueprintsStore.ts           ← Blueprint storage
│
├── .env.local                       ← Your credentials (git-ignored)
├── .env.local.example               ← Template
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔧 How It Works

```
User Chat
    ↓
[Frontend] /blueprints/[id]/page.tsx
    ↓ (sends message)
POST /api/blueprints/[id]/chat
    ↓
[Backend] Creates GitHub API client + LLM tools
    ↓
LLM has access to 3 guarded tools:
  • readRepoFile     (read files from allowed repos)
  • listRepoTree     (list files in repos)
  • searchRepo       (search code in repos)
    ↓
LLM calls tools to gather evidence
    ↓
LLM generates Mermaid diagram
    ↓
Backend extracts diagram + saves state
    ↓
[Response] Mermaid + Evidence used
    ↓
User sees diagram in chat
```

---

## 🛠️ LLM Tools Available

### 1. `readRepoFile`
Read file from a repo
```
Parameters: owner, repo, path, ref (optional)
Returns: file content as string
Example: Read "README.md" from "my-org/service-a"
```

### 2. `listRepoTree`
List files in a directory
```
Parameters: owner, repo, path (optional), recursive (optional)
Returns: list of files with type/size info
Example: List all files in "deploy/" folder
```

### 3. `searchRepo`
Search for keywords
```
Parameters: owner, repo, query
Returns: matching file paths
Example: Search for "kafka", "redis", "dynamodb"
```

All tools are **guarded** - only work within your allowed repos!

---

## 💬 Example Prompts

**Initial Generation:**
> "Generate a Mermaid architecture diagram for these repos. Show services, communication patterns, and technologies."

**Verification:**
> "Search each repo for 'kafka' and 'redis' and tell me where they're actually used."

**Refinement:**
> "Group services by domain (auth, payments, notifications). Show database dependencies."

**Updates:**
> "Service-a talks to service-b over gRPC, not HTTP. Update the diagram and verify by reading their code."

---

## 📚 File Guide

### `lib/githubAPI.ts`
Custom GitHub API wrapper. Methods:
- `readFile(owner, repo, path, ref)` - Get file content
- `listTree(owner, repo, path, recursive)` - List files
- `searchCode(owner, repo, query)` - Search repository
- `getRepo(owner, repo)` - Get repo info
- `getReadme(owner, repo)` - Get README

### `app/api/blueprints/[id]/chat/route.ts`
Chat endpoint that:
1. Receives user message
2. Creates GitHub API client
3. Wraps tools with guards (repo allowlist)
4. Calls LLM with tools
5. Extracts Mermaid diagram
6. Saves state (blueprint, messages, provenance)

### `lib/blueprintsStore.ts`
In-memory blueprint storage:
```typescript
{
  id: string;
  repos: string[];            // allowed repos
  diagramMermaid: string;     // current Mermaid diagram
  provenance: [{              // what was read
    repo, path, ref, at
  }];
  messages: [{                // chat history
    role, content
  }];
}
```

---

## ⚙️ Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `GITHUB_TOKEN` | Yes | `ghp_abc123...` |
| `OPENAI_API_KEY` | Yes | `sk-proj-abc123...` |
| `OPENAI_MODEL` | No | `gpt-4-mini` (default) |

---

## 🧪 Testing the API

Test the chat endpoint directly:

```bash
curl -X POST http://localhost:3000/api/blueprints/demo/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Generate a Mermaid diagram"
    }]
  }'
```

Expected response: Streaming JSON with chat completions.

---

## 📋 Checklist Before Going Live

- [ ] GitHub token created with correct scopes
- [ ] OpenAI key obtained
- [ ] `.env.local` configured with both keys
- [ ] Repos updated in `lib/blueprintsStore.ts`
- [ ] Dev server runs without errors: `npm run dev`
- [ ] Can navigate to http://localhost:3000
- [ ] "Demo Blueprint" link loads chat interface
- [ ] Chat endpoint responds: test with curl above

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `Missing GITHUB_TOKEN` | Add token to `.env.local` |
| `Repo not in Blueprint scope` | Check repo names in `lib/blueprintsStore.ts` |
| `Failed to read file` | Verify token has access to repos |
| `Module not found: @assistant-ui` | Frontend package - optional, install if needed |
| `401 Unauthorized` | Token may be invalid or expired |

---

## 🎯 Next Steps

1. ✅ **Get tokens** (GitHub PAT + OpenAI key)
2. ✅ **Configure `.env.local`**
3. ✅ **Update repos** in `lib/blueprintsStore.ts`
4. ✅ **Run `npm run dev`**
5. ✅ **Test chat** at http://localhost:3000/blueprints/demo
6. 📊 **Refine system prompt** in `route.ts` (line ~180)
7. 💾 **Add database** to replace in-memory store
8. 🚀 **Deploy** to Vercel/Railway/AWS

---

## 📖 Documentation Files

- **`README.md`** - Full documentation
- **`QUICKSTART.md`** - Setup guide
- **`MIGRATION_NOTES.md`** - Details on why we switched from MCP

---

**Status:** ✅ Ready to run! 

Follow the **Quick Start** section above to get going.
