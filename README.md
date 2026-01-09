# Blueprint Generator

A conversational AI chat interface for exploring and discussing GitHub repositories. Analyze code architecture, ask questions, and generate diagrams through natural dialogue.

## Features

- **Conversational UI**: Natural back-and-forth dialogue like ChatGPT
- **Real-time Streaming**: See responses as they're generated word-by-word
- **Dynamic Repo Selection**: Add or change repositories mid-conversation via sidebar
- **GitHub API Integration**: Access repository content directly
- **Free LLM Support**: Powered by Mistral AI
- **Optional Diagrams**: Generate Mermaid diagrams when helpful (not forced)
- **Persistent Chat**: Messages stored in-memory per blueprint

## ⚠️ Important Notes

### Storage
- Chat messages and blueprints are stored **in-memory only** (lost on server restart)
- For production use, implement persistent storage (database)
- See "Future Improvements" section below

### Environment Variables
All required environment variables must be configured at startup:
- `GITHUB_TOKEN` - **Required** for GitHub API access
- `MISTRAL_API_KEY` - **Required** for AI responses

The app will fail to start if `GITHUB_TOKEN` is missing.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` with:

```bash
# GitHub Personal Access Token (classic)
# Generate at: https://github.com/settings/tokens
# Scopes: repo, read:user, read:org
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"

# Mistral API Key (FREE - recommended!)
# Get from: https://console.mistral.ai/api-keys/
MISTRAL_API_KEY="your-key-here"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Input Repositories

On the home page, enter one or more GitHub repositories (e.g., `vercel/next.js`, `facebook/react`), or use quick-start templates. The chat page will open with those repos ready for analysis.

## Usage

1. Go to home page and enter repository names (e.g., `vercel/next.js`, `facebook/react`)
2. Click "Start Chat" or use a quick-start template
3. Ask natural questions:
   - "What's the architecture of this project?"
   - "What dependencies does it use?"
   - "Draw a diagram of the main components"
   - "What language is this written in?"
4. Edit repositories mid-conversation using the sidebar (Edit/Done toggle)
5. Responses stream in real-time as they're generated
6. AI generates diagrams when relevant—diagrams are optional, not forced

## Architecture

### Key Files

- **`app/page.tsx`**: Home page with repo input UI
- **`app/blueprints/[id]/page.tsx`**: Chat interface with real-time streaming and sidebar repo management
- **`app/api/blueprints/[id]/chat/route.ts`**: Chat API endpoint with Mistral AI integration
- **`lib/blueprintsStore.ts`**: Blueprint state management
- **`lib/githubAPI.ts`**: GitHub REST API client wrapper

## API Endpoint

### `POST /api/blueprints/:id/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "What's the architecture?" }
  ],
  "repos": ["owner/repo"]
}
```

**Response**: Streaming text response with optional Mermaid diagrams in code blocks

## LLM Models

- **Mistral AI** (default, free): `mistral-large-latest` - Fast and capable

The model uses conversational system prompts that encourage natural dialogue and optional diagram generation.

## Future Improvements

- [ ] Persist to real database (chat history, blueprints) - **Required for production**
- [ ] User authentication and multi-user support
- [ ] Rate limiting and usage quotas
- [ ] Diagram diff viewer
- [ ] Export chat as markdown or PDF
- [ ] Support for private repositories with custom tokens
- [ ] Caching layer for frequently accessed repos

## Production Deployment

### Before deploying to production:

1. **Implement persistent storage**: Replace in-memory `blueprintsStore` with a database
2. **Add user authentication**: Protect endpoints and tie blueprints to users
3. **Configure environment**: Ensure all required env vars are set via CI/CD secrets
4. **Enable HTTPS**: All API calls should use HTTPS in production
5. **Add rate limiting**: Prevent abuse of GitHub and LLM APIs
6. **Monitor errors**: Set up error tracking (Sentry, LogRocket, etc.)
7. **Set up logging**: Configure structured logging for debugging

### Security headers
Security headers are automatically added by Next.js config:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricts camera, microphone, geolocation

## License

ISC
