# 🎯 Public Demo Repos Update

## What Changed ✅

### 1. Default Demo Repos Updated
**File**: `lib/blueprintsStore.ts`

**Before** (fictional demo repos):
```typescript
repos: [
  "my-org/service-a",
  "my-org/service-b",
  // ... etc
]
```

**After** (real public repos):
```typescript
repos: [
  "vercel/next.js",           // Web framework
  "nodejs/node",              // Runtime
  "kubernetes/kubernetes",    // Orchestration
  "prometheus/prometheus",    // Monitoring
  "elastic/elasticsearch",    // Search/analytics
  "hashicorp/terraform",      // Infrastructure as code
  "docker/cli",               // Container platform
  "etcd-io/etcd",             // Distributed consensus
  "grpc/grpc",                // RPC framework
  "apache/kafka",             // Message broker
]
```

**Benefits**:
✅ Can test immediately - no setup needed
✅ All repos are public - your GitHub token works right away
✅ Popular, well-documented projects - great for learning
✅ Diverse ecosystem - shows different architectural patterns

---

### 2. Documentation Updated

**Files Changed**:
- `00_START_HERE.md` - Simplified to 2-step setup
- `START.md` - Updated with demo repos
- `QUICKSTART.md` - Updated example prompts
- `README.md` - Usage guide updated
- `PROMPTS.md` - NEW! 28 example prompts for demo repos

**Key Changes**:
- Removed need to "update your repos" step (optional now)
- Added example prompts specific to the public repos
- Emphasized "test immediately" angle
- Created comprehensive prompt guide

---

## Result: True 3-Minute Setup ✅

### Before
1. Get GitHub token (2 min)
2. Update .env.local (1 min)
3. Update repos in blueprintsStore.ts (1 min)
4. Run and test (2 min)
= **6 minutes**

### After  
1. Get GitHub token (2 min)
2. Update .env.local with token (1 min)
3. Run `npm run dev` and test (2 min)
= **5 minutes** with demo repos ready to go! ✅

---

## Example Prompts (Now Available!)

Try these immediately:

```
"Show me the architecture of these open source projects"
"What programming languages are used?"
"Group these by category: infrastructure, runtime, application"
"Which projects are most widely used?"
"Create a dependency graph"
```

See [PROMPTS.md](./PROMPTS.md) for 28 example prompts!

---

## Files Updated

| File | Changes |
|------|---------|
| `lib/blueprintsStore.ts` | Updated repos to public projects |
| `00_START_HERE.md` | Simplified setup steps |
| `START.md` | Updated with demo info |
| `QUICKSTART.md` | Updated with public repos |
| `README.md` | Updated usage examples |
| `PROMPTS.md` | NEW - 28 example prompts |

---

## Default Demo Repos

All public, all well-documented, all immediately accessible:

| Repo | Purpose | Type |
|------|---------|------|
| vercel/next.js | React web framework | Application |
| nodejs/node | JavaScript runtime | Infrastructure |
| kubernetes/kubernetes | Container orchestration | Infrastructure |
| prometheus/prometheus | Monitoring system | Infrastructure |
| docker/cli | Container platform | Infrastructure |
| apache/kafka | Message broker | Infrastructure |
| hashicorp/terraform | IaC tool | Infrastructure |
| grpc/grpc | RPC framework | Library |
| elastic/elasticsearch | Search engine | Infrastructure |
| etcd-io/etcd | Distributed consensus | Infrastructure |

---

## How to Use Demo Repos

### Immediately
```bash
npm run dev
# Go to http://localhost:3000
# Click "Demo Blueprint"
# Try a prompt from PROMPTS.md
```

### Later (When Ready)
Edit `lib/blueprintsStore.ts` to use your own repos:
```typescript
repos: [
  "your-org/your-repo",
  // ... add your repos
]
```

---

## Benefits

✅ **Zero friction**: Works right after token setup
✅ **Educational**: Learn from real production code
✅ **Diverse**: See different architectural approaches
✅ **Public**: No permissions issues
✅ **Well-known**: Easy to understand what each does
✅ **Real-world**: Not contrived examples

---

## Next: Test It Out!

1. Get your GitHub token from https://github.com/settings/tokens
2. Add to `.env.local`
3. Run `npm run dev`
4. Visit http://localhost:3000
5. Click "Demo Blueprint"
6. Try: "Show me the architecture"

**That's it!** Start exploring! 🚀

---

See [PROMPTS.md](./PROMPTS.md) for 28 ready-to-use example prompts with the demo repos.
