# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation is an AI chat interface for creating any of the 11 supported legal agreement types. The user chats with the AI, which detects the document type, extracts the relevant fields, and populates a live document preview. User authentication is planned for a future ticket.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-7: V1 Technical Foundation)
- Multi-stage Dockerfile: Node build stage produces Next.js static export; Python/uvicorn stage serves it
- FastAPI backend (`backend/`) as a `uv` project — serves static frontend + initialises SQLite DB on startup
- SQLite schema: `users` and `documents` tables created fresh on each container start
- `docker-compose.yml` for single-command `docker compose up`
- Start/stop scripts for Mac, Linux, and Windows (`scripts/`)
- Next.js static export configured (`output: 'export'` in `next.config.ts`)
- Mutual NDA form with live preview and PDF download (client-side, no backend calls)

### Completed (PL-8: AI Chat for Mutual NDA)
- Freeform AI chat replaces the manual form in the left panel (`ChatSection` component)
- `GET /api/chat/greeting` — static greeting to open the conversation
- `POST /api/chat/message` — LiteLLM/Cerebras structured output extracts all 13 NDA fields from conversation history; returns `{reply, ...fields}`
- Fields accumulate client-side; `NDAPreview` and `DownloadButton` unchanged
- CORS middleware on FastAPI for local dev (frontend:3000 → backend:8001)
- `NEXT_PUBLIC_API_URL` env var in `frontend/.env.local` for dev; empty in production (relative URL)

### Completed (PL-9: Expand to All Supported Legal Document Types)
- Multi-document support: all 11 document types from catalog.json now supported
- AI detects document type from conversation, then collects type-specific fields
- `DocumentResponse` Pydantic model with 22 optional fields covering all doc types (party fields for NDA, customer/provider for others, plus type-specific fields like `subscription_period`, `pilot_period`, `uptime_target`, etc.)
- System prompt updated with all 11 doc types and their required fields; AI asks 1-2 questions at a time
- `frontend/app/page.tsx` — `TEMPLATE_MAP` maps doc type keys to `/templates/*.md` paths; template fetched dynamically when `document_type` is determined
- `frontend/components/ChatSection.tsx` — accumulates all 22 fields (including `document_type`) from each API response
- `frontend/components/DocumentPreview.tsx` — generic component with:
  - `replaceSpan()` helper that substitutes span placeholders by inner text across all CSS classes
  - NDA-specific cover (Party 1 / Party 2 columns) for `Mutual-NDA`
  - Generic key-terms grid for all other doc types, driven by `DOC_COVER_FIELDS` config per type
  - Placeholder card shown until doc type is determined
- `frontend/components/DownloadButton.tsx` — print-to-PDF with NDA cover or generic key-terms cover depending on doc type; disabled until doc type is set

### Current API Endpoints
- `GET /api/health` - Health check
- `GET /api/chat/greeting` - Initial AI greeting
- `POST /api/chat/message` - Send message; returns AI reply + extracted field values for detected doc type

### Planned (not yet implemented)
- Auth routes: `/api/auth/signup`, `/api/auth/signin`, `/api/auth/signout`, `/api/auth/me`
- Document persistence: `/api/documents` CRUD (auth required)
- Brand color scheme applied to frontend
- User authentication UI (signup/signin modals, user menu)
