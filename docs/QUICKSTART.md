# Quick Start Guide

## Step-by-step setup for the Blueprint Generator

### Prerequisites
- Node.js 18+ 
- npm or yarn
- **GitHub Personal Access Token** (classic) - [Generate here](https://github.com/settings/tokens)
  - Scopes needed: `repo`, `read:user`, `read:org`
- **OpenAI API key** - [Get here](https://platform.openai.com/api-keys)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.local.example .env.local

# 3. Edit .env.local with your credentials
# Fill in:
# - GITHUB_TOKEN (Personal Access Token from GitHub)
# - OPENAI_API_KEY (from OpenAI)

# 4. Update your repositories
# Edit lib/blueprintsStore.ts and update the repos array with your GitHub repos

# 5. Start development server
npm run dev
```

### First Run

1. Open http://localhost:3000 in your browser
2. Click "Demo Blueprint" link
3. Try this prompt:

   > "Show me the architecture and communication patterns between these open source projects"

4. The model will:
   - Read README.md files from popular projects
   - Check deployment and architecture patterns
   - Search for interesting keywords
   - Generate a Mermaid diagram with evidence

5. Follow up with refinements:
   - "What programming languages are used?"
   - "Show which projects are client-side vs server-side"
   - "Add deployment targets (containers, nodes, cloud)"
   - "Which ones are infrastructure vs application?"

### Example Repos to Start With

If you need test repos, the default demo uses these popular open source projects:
- `vercel/next.js` - Web framework
- `nodejs/node` - JavaScript runtime
- `kubernetes/kubernetes` - Container orchestration
- `prometheus/prometheus` - Monitoring system
- `docker/cli` - Container platform
- `apache/kafka` - Message broker
- `hashicorp/terraform` - Infrastructure as code
- `grpc/grpc` - RPC framework
- `elastic/elasticsearch` - Search and analytics
- `etcd-io/etcd` - Distributed consensus

These are all public repos, so your GitHub token can access them immediately!

When ready, replace with your own repos in `lib/blueprintsStore.ts`.

### Debugging

**Authentication errors**:
- Verify GITHUB_TOKEN is a valid personal access token with `repo` scope
- Verify OPENAI_API_KEY is correct
- Check `.env.local` is in the project root

**File read errors**:
- Make sure repos in `lib/blueprintsStore.ts` are spelled correctly
- Verify the GitHub token has access to those repos

**Mermaid not rendering**:
- The diagram is still generated and stored
- Check browser console for render errors
- Try simpler diagram structures first

### Next Steps

1. **Customize Blueprint scope**: Update `lib/blueprintsStore.ts` with your actual repos
2. **Persist to database**: Replace in-memory store with your DB
3. **Add versioning**: Implement the attestation endpoint for diagram snapshots
4. **Deploy**: Use Vercel, Railway, or your preferred Node.js host

### Configuration Options

Edit `app/api/blueprints/[id]/chat/route.ts` system prompt to customize:
- Diagram style preferences
- What architecture details to focus on
- Terminology and conventions
- Evidence requirements

### Environment Variables Reference

| Variable | Required | How to Get |
|----------|----------|-----------|
| `GITHUB_TOKEN` | Yes | https://github.com/settings/tokens (classic, with `repo` scope) |
| `OPENAI_API_KEY` | Yes | https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | No | Defaults to `gpt-4-mini` |

### Useful Prompts

- **Initial diagram**: "Generate a Mermaid architecture diagram showing all services, their communication patterns, and deployment targets."

- **Verification**: "Search each repo for usage of kafka, redis, or databases and verify what's actually there."

- **Refinement**: "Group these by domain and add legends for different communication protocols."

- **Export**: "Output the final diagram as a valid Mermaid that I can copy-paste."

---

For more details, see [README.md](./README.md)
