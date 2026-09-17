# Development

Install Node.js and run `npm install`. Use `npm run dev` for the Vite server. Use `npm run build` for a production build. Keep changes focused and update docs for architectural decisions. The official Supabase Codex plugin is installed locally; see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the required restart, OAuth and verification status.

## Supabase setup

1. In a supported Codex session, verify and authenticate the installed Supabase MCP connection, then identify and scope the intended Supabase project. A plugin mention alone is not proof that MCP tools are available.
2. Create a Supabase project if one does not already exist.
3. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Apply and verify migrations through Supabase MCP, keeping the resulting migration files in Git.
5. Set `GEMINI_API_KEY` as an Edge Function secret; never put it in `.env.local` or frontend code.
6. Deploy `supabase/functions/extract-vocabulary` when the project is ready.

The checked-in migration and function are implementation foundations and have not been deployed against a live Supabase project yet. Do not claim live backend behavior until an authenticated MCP query and a representative deployment check succeed.

## Git handoff

The canonical remote is `origin` at `https://github.com/Jules-Gossiaux/New_chapter_prep.git`. Work is developed on `codex/*` branches and merged into `main` through review. Before and after each task, inspect Git status. Commit only focused, verified changes with conventional commit messages, then push the feature branch when credentials and network access permit. Never commit API keys or book content.
