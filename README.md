# ChapterPrep

ChapterPrep is a mobile-first, local-first web app for preparing vocabulary before reading in another language. Product scope is defined in [the PRD](docs/CHAPTERPREP_PRD.md).

## Quick start

```sh
npm install
npm run dev
```

Checks: `npm run build`, `npm test`, `npm run lint`, and `npm run format:check`.

The current branch contains the frontend product prototype: a navigable landing/auth preview, library, book and chapter workflow, extraction review, preparation mode, annotated reader, personal vocabulary list, direct word lookup, and book-scoped CSV export. It uses coherent mock data so the complete UX can be reviewed before backend implementation.

Authentication, server persistence, live translation, and Gemini extraction are not connected yet. The domain validation, repository, and provider boundaries remain available for the backend phase; no API key is shipped to the browser.

The backend foundation is now scaffolded under `supabase/`: PostgreSQL tables/RLS, email/password Auth wiring, and a server-side Gemini extraction function with a 500-word limit. It requires a Supabase project and secrets before it becomes live. The official Supabase Codex plugin (MCP plus Agent Skills) is installed locally; see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for activation and verification state.

## Git workflow

Development happens on `codex/*` branches and is merged into `main` after verification. See [RULES.md](RULES.md) for the strict workflow and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local setup.
