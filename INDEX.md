# 📖 Blueprint Generator - Documentation Index

## 🚀 Start Here

**New to the project?** Start with these in order:

1. **[SUMMARY.md](./SUMMARY.md)** - High-level overview (5 min read)
2. **[QUICKSTART.md](./QUICKSTART.md)** - Get it running (10 min)
3. **[EXAMPLES.md](./EXAMPLES.md)** - See it in action (10 min)

---

## 📚 Documentation by Topic

### Setup & Configuration
- **[QUICKSTART.md](./QUICKSTART.md)** - Installation and first run
- **[EXAMPLES.md](./EXAMPLES.md)** - Configuration examples + chat examples
- **[.env.local.example](./.env.local.example)** - Environment template

### Understanding the System
- **[SUMMARY.md](./SUMMARY.md)** - Architecture overview
- **[README.md](./README.md)** - Complete technical documentation
- **[MIGRATION_NOTES.md](./MIGRATION_NOTES.md)** - Why GitHub API (not MCP)

### Status & Progress
- **[CHECKLIST.md](./CHECKLIST.md)** - What's done, what you need to do
- **[STATUS.md](./STATUS.md)** - Current project status

---

## 🎯 Quick Links by Use Case

### "I want to get it running NOW"
→ [QUICKSTART.md](./QUICKSTART.md) (10 minutes)

### "Show me examples of how it works"
→ [EXAMPLES.md](./EXAMPLES.md) (Example chat interactions)

### "I need full technical details"
→ [README.md](./README.md) (Complete guide)

### "What exactly changed from MCP?"
→ [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

### "What's the status? Is it ready?"
→ [CHECKLIST.md](./CHECKLIST.md) or [STATUS.md](./STATUS.md)

### "I'm lost, give me an overview"
→ [SUMMARY.md](./SUMMARY.md)

---

## 📋 File Structure

```
blueprint-generator/
│
├── 📖 Documentation Files
│   ├── README.md                ← Full technical guide
│   ├── QUICKSTART.md            ← Get started (10 min)
│   ├── EXAMPLES.md              ← Configuration + chat examples
│   ├── SUMMARY.md               ← High-level overview
│   ├── CHECKLIST.md             ← Setup checklist
│   ├── STATUS.md                ← Current status
│   ├── MIGRATION_NOTES.md       ← Why we switched from MCP
│   └── INDEX.md                 ← This file
│
├── 🚀 Application Code
│   ├── app/
│   │   ├── api/blueprints/[id]/chat/route.ts   ← Chat API
│   │   ├── blueprints/[id]/page.tsx            ← Chat UI
│   │   ├── layout.tsx                          ← Root layout
│   │   └── page.tsx                            ← Home page
│   └── lib/
│       ├── githubAPI.ts                        ← GitHub API client
│       └── blueprintsStore.ts                  ← Storage
│
├── ⚙️ Configuration
│   ├── package.json                 ← Dependencies
│   ├── tsconfig.json                ← TypeScript
│   ├── next.config.ts               ← Next.js
│   ├── .env.local                   ← Your secrets ⚠️ NEED TO FILL IN
│   └── .env.local.example           ← Template
│
└── 📦 Build Output (auto-generated)
    ├── node_modules/
    └── .next/
```

---

## 🎓 Learning Path

### Beginner
1. Read: [SUMMARY.md](./SUMMARY.md)
2. Follow: [QUICKSTART.md](./QUICKSTART.md)
3. Read: [EXAMPLES.md](./EXAMPLES.md) - Configuration section

### Intermediate  
1. Read: [README.md](./README.md)
2. Review: [EXAMPLES.md](./EXAMPLES.md) - Chat interactions
3. Check: [CHECKLIST.md](./CHECKLIST.md) - What's implemented

### Advanced
1. Study: [README.md](./README.md) - Architecture section
2. Review: `app/api/blueprints/[id]/chat/route.ts` - Backend code
3. Review: `lib/githubAPI.ts` - GitHub integration
4. Read: [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) - Design decisions

---

## ✅ 3-Step Setup

### 1. **Configure** (2 min)
→ Read: [EXAMPLES.md - Section 1-2](./EXAMPLES.md#1-github-token-setup)

### 2. **Update Repos** (1 min)
→ Read: [EXAMPLES.md - Section 3](./EXAMPLES.md#3-repository-configuration)

### 3. **Run & Test** (1 min)
```bash
npm run dev          # Start server
# Visit http://localhost:3000
```

---

## 🔍 Navigation by Filename

### If you see file: `.env.local`
→ Read: [EXAMPLES.md - Section 2](./EXAMPLES.md#2-environment-configuration)

### If you see file: `lib/blueprintsStore.ts`
→ Read: [EXAMPLES.md - Section 3](./EXAMPLES.md#3-repository-configuration)

### If you see file: `app/api/blueprints/[id]/chat/route.ts`
→ Read: [README.md - API Endpoint](./README.md#api-endpoint)

### If you see file: `lib/githubAPI.ts`
→ Read: [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

---

## ❓ Frequently Asked Questions

**Q: Where do I get a GitHub token?**
→ [EXAMPLES.md - Getting Your GitHub Token](./EXAMPLES.md#getting-your-github-token)

**Q: What repos can the LLM access?**
→ [README.md - Guarded Tool Access](./README.md#tools-available-to-the-llm)

**Q: How do I add more repos?**
→ [EXAMPLES.md - Repository Configuration](./EXAMPLES.md#3-repository-configuration)

**Q: What's the difference from MCP?**
→ [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

**Q: Is this production-ready?**
→ [STATUS.md](./STATUS.md) - Yes, with caveats

**Q: How do I deploy it?**
→ [SUMMARY.md - Deployment Options](./SUMMARY.md#deployment-options)

---

## 🚨 Troubleshooting

**Can't get it running?**
→ [QUICKSTART.md - Debugging](./QUICKSTART.md#debugging)

**Getting API errors?**
→ [EXAMPLES.md - Troubleshooting Configuration](./EXAMPLES.md#5-troubleshooting-configuration)

**Don't understand the architecture?**
→ [README.md - Architecture](./README.md#architecture) or [SUMMARY.md - Architecture](./SUMMARY.md#architecture)

---

## 📞 Support

All documentation is self-contained. Check the files above for:
- Setup questions → QUICKSTART.md
- How to use it → EXAMPLES.md
- Technical details → README.md
- Current status → STATUS.md or CHECKLIST.md

---

## 📝 Document Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| README.md | Complete technical guide | 20 min |
| QUICKSTART.md | Get started fast | 10 min |
| EXAMPLES.md | Configuration + examples | 15 min |
| SUMMARY.md | High-level overview | 5 min |
| CHECKLIST.md | Setup progress | 5 min |
| STATUS.md | Current status | 3 min |
| MIGRATION_NOTES.md | Design decisions | 10 min |
| INDEX.md | This file | 5 min |

---

## ✨ What's Next?

1. Pick a document above based on your needs
2. Follow the steps
3. Get it running
4. Start generating diagrams!

**Recommended first step**: [SUMMARY.md](./SUMMARY.md) (5 min overview)

Then: [QUICKSTART.md](./QUICKSTART.md) (10 min to get running)

---

**Happy diagramming!** 🎉
