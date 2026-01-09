# Blueprint Generator

A conversational AI chat interface for exploring and discussing GitHub repositories. Analyze code architecture, ask questions, and generate diagrams through natural dialogue.

## Features

- **Conversational UI**: Natural back-and-forth dialogue like ChatGPT
- **Real-time Streaming**: See responses as they're generated word-by-word
- **Dynamic Repo Selection**: Add or change repositories mid-conversation via sidebar
- **GitHub API Integration**: Access repository content directly
- **Free LLM Support**: Powered by Mistral AI (free tier) with OpenAI fallback
- **Optional Diagrams**: Generate Mermaid diagrams when helpful (not forced)
- **Persistent Chat**: Messages stored in-memory per blueprint

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
USE_MISTRAL="true"

# OpenAI API Key (optional - paid alternative)
OPENAI_API_KEY="sk-..."
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
- **`app/api/blueprints/[id]/chat/route.ts`**: Chat API endpoint with Mistral/OpenAI integration
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
- **OpenAI** (fallback, paid): `gpt-4-mini` - For production use

Both models use conversational system prompts that encourage natural dialogue and optional diagram generation.

## Future Improvements

- [ ] Persist to real database (chat history, blueprints)
- [ ] User authentication
- [ ] Rate limiting
- [ ] Diagram diff viewer
- [ ] Export chat as markdown or PDF

## License

ISC
