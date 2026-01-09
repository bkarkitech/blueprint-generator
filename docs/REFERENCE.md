# 📇 Blueprint Generator - Quick Reference Card

## 🚀 3-Minute Setup

```bash
# 1. Get GitHub token from https://github.com/settings/tokens
# 2. Edit .env.local and add: GITHUB_TOKEN="ghp_..."
# 3. Edit lib/blueprintsStore.ts and update repos
# 4. Run:
npm run dev

# 5. Visit http://localhost:3000
```

---

## 📂 File Quick Access

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.local` | Your secrets | ✏️ ADD TOKEN |
| `lib/blueprintsStore.ts` | Repo list | ✏️ UPDATE REPOS |
| `README.md` | Full docs | 📖 Read |
| `QUICKSTART.md` | Setup guide | 📖 Read |
| `EXAMPLES.md` | Config examples | 📖 Read |
| `app/api/blueprints/[id]/chat/route.ts` | Chat API | 👀 Reference only |
| `lib/githubAPI.ts` | GitHub client | 👀 Reference only |

---

## ⚙️ Environment Variables

```bash
# .env.local
GITHUB_TOKEN="ghp_your_token_here"                    # Required - from GitHub
OPENAI_API_KEY="sk-proj-..."                          # Already set
OPENAI_MODEL="gpt-4-mini"                             # Default - don't change
```

---

## 📋 Repos Configuration

```typescript
// lib/blueprintsStore.ts - Update this:
repos: [
  "your-org/repo-name",    // Format: owner/repo
  "your-org/another-repo",
  // Add your repos here
]
```

---

## 🎯 How to Get GitHub Token

1. Visit: https://github.com/settings/tokens
2. Click: "Generate new token (classic)"
3. Name: `blueprint-generator`
4. Scopes: `repo`, `read:user`, `read:org`
5. Click: "Generate token"
6. Copy immediately (won't show again!)
7. Paste in `.env.local`: `GITHUB_TOKEN="ghp_..."`

---

## 🔌 The 3 Tools (for LLM)

| Tool | What It Does | Returns |
|------|-------------|---------|
| `readRepoFile` | Reads file content | File text |
| `listRepoTree` | Lists files/folders | File list |
| `searchRepo` | Searches code | Matching paths |

All tools are **guarded** - only allowed repos can be accessed.

---

## 💬 Example Chat

**User**: "Generate architecture diagram"

**LLM**: Reads README.md → searches for keywords → reads configs → generates Mermaid

**Response**: Diagram + evidence list showing which files were used

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing GITHUB_TOKEN" | Add token to `.env.local` |
| "Repo not in scope" | Check spelling in `blueprintsStore.ts` |
| "Failed to read file" | Verify token has repo access |
| "Module not found" | Run `npm install` |
| "Port 3000 in use" | Change port or kill process on 3000 |

---

## 📚 Documentation Map

```
Start here:
  ↓
SUMMARY.md (5 min overview)
  ↓
QUICKSTART.md (10 min to run)
  ↓
EXAMPLES.md (see real examples)
  ↓
README.md (full technical docs)
```

---

## ✅ Checklist Before Running

- [ ] Added `GITHUB_TOKEN` to `.env.local`
- [ ] Updated repos in `lib/blueprintsStore.ts`
- [ ] Ran `npm install` (already done)
- [ ] Know your OpenAI API key (already configured)
- [ ] Have access to repos (token must have permission)

---

## 🎬 Run & Test

```bash
# Start server
npm run dev

# In browser:
# 1. Go to http://localhost:3000
# 2. Click "Demo Blueprint"
# 3. Type: "Generate architecture diagram"
# 4. Wait for response with Mermaid diagram
```

---

## 📊 Project Stats

- **Files created**: 16
- **Lines of code**: ~500
- **TypeScript**: ✅
- **Next.js**: ✅
- **Tests**: In production
- **Documentation**: ✅ (9 files)
- **Status**: Ready to use

---

## 🔐 Security Notes

✅ Only accesses repos in your allowed list  
✅ Uses standard GitHub REST API  
✅ No external servers needed  
✅ Token-based auth (industry standard)  
✅ All validation server-side  

---

## 🎓 Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production server

# Maintenance
npm install          # Install dependencies
npm list             # List installed packages
npm update           # Update packages
```

---

## 💡 Tips

1. **Slow diagrams?** Fewer repos = faster responses
2. **Bad diagrams?** More evidence in prompt helps
3. **Want verification?** Ask LLM to verify with tool calls
4. **Custom prompts?** Edit system prompt in `route.ts`
5. **Need more tools?** Add them to GitHub API client

---

## 📞 Get Help

| Issue | Check |
|-------|-------|
| Setup | [QUICKSTART.md](./QUICKSTART.md) |
| Config | [EXAMPLES.md](./EXAMPLES.md) |
| Tech | [README.md](./README.md) |
| Lost? | [INDEX.md](./INDEX.md) |

---

## ⏱️ Setup Time Estimate

| Task | Time |
|------|------|
| Get GitHub token | 2 min |
| Edit `.env.local` | 1 min |
| Edit `blueprintsStore.ts` | 1 min |
| Run `npm run dev` | 5 sec |
| **Total** | **4 min** |

---

## 🚀 Ready?

1. Get token → https://github.com/settings/tokens
2. Edit `.env.local` → Add `GITHUB_TOKEN="ghp_..."`
3. Edit `blueprintsStore.ts` → Update repos
4. Run → `npm run dev`
5. Test → http://localhost:3000

**That's it!** You're ready to generate diagrams! 🎉
