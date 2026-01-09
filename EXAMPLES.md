# 📋 Configuration Examples

## 1. GitHub Token Setup

### Getting Your GitHub Token

```bash
# Navigate to this URL:
https://github.com/settings/tokens

# Click: Generate new token → Generate new token (classic)

# Fill in:
- Token name: "blueprint-generator"
- Expiration: 90 days (or your preference)
- Scopes: Select these checkboxes:
  ✓ repo (Full control of private repositories)
  ✓ read:user (Read user profile data)
  ✓ read:org (Read organization data)

# Click "Generate token"
# Copy immediately - you won't see it again!
# Format: ghp_xxxxxxxxxxxxxxxxxxx...
```

---

## 2. Environment Configuration

### .env.local Example

```bash
# GitHub Token (from step above)
GITHUB_TOKEN="ghp_abcdef123456789ghijklmnop"

# OpenAI API Key (keep as provided or update your own)
OPENAI_API_KEY="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"

# OpenAI Model (default is fine)
OPENAI_MODEL="gpt-4-mini"
```

---

## 3. Repository Configuration

### lib/blueprintsStore.ts Example

**Before (Demo):**
```typescript
repos: [
  "my-org/service-a",
  "my-org/service-b",
  "my-org/service-c",
  "my-org/web-frontend",
  // ... etc
]
```

**After (Your Repos):**
```typescript
repos: [
  "your-github-org/backend-service",
  "your-github-org/frontend-app",
  "your-github-org/api-gateway",
  "your-github-org/payment-service",
  "your-github-org/notification-service",
  "your-github-org/shared-libs",
  "your-github-org/infrastructure",
  "your-github-org/observability",
]
```

**Rules:**
- Must be `"owner/repo-name"` format
- These are the ONLY repos the LLM can access
- Makes it safe for sensitive repositories
- Can have up to 50+ repos

---

## 4. Example Chat Interactions

### Example 1: Generate Architecture Diagram

```
User: 
  "Generate a Mermaid architecture diagram showing all the services, 
   their communication patterns, and deployment targets."

Model Actions:
  1. Lists each repo with listRepoTree
  2. Reads README.md from each repo
  3. Searches for keywords: "kubernetes", "docker", "grpc", "http", "kafka"
  4. Reads deployment configs (Dockerfile, helm/, terraform/)
  5. Generates Mermaid diagram
  
Response:
  Here's the architecture:
  
  ```mermaid
  graph LR
    client[Web Client]
    lb[Load Balancer]
    api[API Gateway]
    backend[Backend Service]
    db[(Database)]
    cache[(Redis Cache)]
    
    client -->|HTTP| lb
    lb -->|gRPC| api
    api -->|REST| backend
    backend -->|SQL| db
    backend -->|SET/GET| cache
  ```
  
  Evidence used:
  - your-org/api-gateway:README.md
  - your-org/api-gateway:Dockerfile
  - your-org/backend-service:helm/values.yaml
  - your-org/backend-service:docker-compose.yml
```

### Example 2: Verify Technology Stack

```
User:
  "Does the payment service use Stripe or PayPal?"

Model Actions:
  1. Searches payment-service for "stripe" and "paypal"
  2. Reads package.json or requirements.txt
  3. Searches for SDK imports
  
Response:
  The payment service uses Stripe. Evidence:
  - Found stripe SDK import in payment-service:src/integrations/stripe.ts
  - payment-service:package.json includes "@stripe/stripe-js"
  - Detected Stripe API key usage in environment config
```

### Example 3: Refine Diagram

```
User:
  "Group services by domain: auth, payments, and notifications.
   Add a legend showing HTTP vs gRPC vs event-driven communication."

Model Actions:
  1. Updates existing Mermaid with grouping
  2. Verifies communication protocols from config files
  3. Regenerates diagram
  
Response:
  Updated architecture with domains:
  
  ```mermaid
  graph LR
    subgraph auth["Auth Domain"]
      authSvc[Auth Service]
      authDb[(Auth DB)]
    end
    
    subgraph payments["Payments Domain"]
      paymentSvc[Payment Service]
      paymentDb[(Payment DB)]
    end
    
    subgraph notifications["Notifications Domain"]
      notifSvc[Notification Service]
      queue[Message Queue]
    end
    
    authSvc -->|HTTP| paymentSvc
    paymentSvc -->|Event| queue
    queue -->|Consume| notifSvc
  ```
  
  Legend:
  - HTTP: Synchronous REST calls
  - gRPC: High-performance RPC (internal)
  - Event: Asynchronous via message queue
  
  Evidence used:
  - Analyzed .github/workflows/ for deployment patterns
  - Read terraform/ configs for infrastructure
  - Checked kubernetes/ manifests for service definitions
```

### Example 4: Check Dependencies

```
User:
  "Search all repos for usage of Kafka, Redis, and DynamoDB.
   Create a table showing which services use what."

Model Actions:
  1. Searches each repo for "kafka"
  2. Searches each repo for "redis"
  3. Searches each repo for "dynamodb"
  4. Reads config files to verify
  
Response:
  Dependencies Inventory:
  
  | Service | Kafka | Redis | DynamoDB |
  |---------|-------|-------|----------|
  | backend-service | ✅ | ✅ | ✅ |
  | payment-service | ❌ | ✅ | ✅ |
  | notification-service | ✅ | ❌ | ❌ |
  | api-gateway | ❌ | ✅ | ❌ |
  
  Evidence:
  - backend-service uses kafka for events, redis for caching, dynamodb for user profiles
  - payment-service uses redis for rate limiting and dynamodb for transaction history
  - notification-service only uses kafka for consuming events
  - api-gateway only uses redis for session store
```

---

## 5. Troubleshooting Configuration

### If you get "Repo not in Blueprint scope"

**Problem**: Repo name is misspelled or not in the list

**Solution**:
```typescript
// WRONG:
repos: [
  "your-org/backend",  // Missing 'service' suffix
]

// RIGHT:
repos: [
  "your-org/backend-service",  // Match exactly
]
```

### If you get authentication errors

**Problem**: Token doesn't have the right permissions

**Solution**:
1. Delete your old token
2. Generate a NEW token with these scopes:
   - ✅ `repo` (not just `read:repo`)
   - ✅ `read:user`
   - ✅ `read:org`

### If repos are private

**Problem**: Token can't access private repos

**Solution**:
- Your GitHub token MUST have `repo` scope (checked during token generation)
- Your GitHub account MUST have access to the private repos
- Make sure you're using the same GitHub account

---

## 6. Production Considerations

### Before Deploying:

```typescript
// 1. Use environment-based config
const REPOS = process.env.BLUEPRINT_REPOS?.split(',') || []

// 2. Add rate limiting
const rateLimit = new Map()

// 3. Add authentication
app.use(authenticateUser)

// 4. Use a real database
const db = new PostgresBlueprints()

// 5. Add audit logging
logger.info(`User ${userId} accessed repo ${repo}`)
```

### Example for Production:

```bash
# .env.production
GITHUB_TOKEN="ghp_prod_token_here"
OPENAI_API_KEY="sk-prod_key_here"
DATABASE_URL="postgresql://..."
REQUIRE_AUTH="true"
RATE_LIMIT="100/hour"
```

---

## 7. Quick Reference

### Most Common Setup

```bash
# 1. Get GitHub token from https://github.com/settings/tokens
# 2. Update .env.local
GITHUB_TOKEN="your_token_here"

# 3. Update lib/blueprintsStore.ts
repos: ["your-org/repo1", "your-org/repo2"]

# 4. Start server
npm run dev

# 5. Go to http://localhost:3000
# 6. Click "Demo Blueprint"
# 7. Start chatting!
```

That's it! 🚀
