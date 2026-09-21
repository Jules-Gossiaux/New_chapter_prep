# Development

Install Node.js and run `npm install`. Use `npm run dev` for the Vite server. Use `npm run build` for a production build. Keep changes focused and update docs for architectural decisions. The official Supabase Codex plugin is installed locally; see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the required restart, OAuth and verification status.

## Supabase setup

1. The hosted project `New_chapter_prep` (`auubivhhifkasnlsmine`, `eu-west-1`) is active and reachable through Supabase MCP.
2. The initial schema, RLS hardening, trigger permission, and vocabulary-extraction migrations are applied. Verify changes through Supabase MCP before adding another migration.
3. `.env.local` is local-only and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite after changing either value.
4. Email/password Auth and book/chapter persistence are live when the user is signed in. A new account has an empty library until it creates a book.
5. Set `GEMINI_API_KEY` as an Edge Function secret; never put it in `.env.local` or frontend code. The dashboard path is Project Settings → Edge Functions → Secrets.
6. `vocabulary_frequency` is server-only and currently contains the top 10,000 source entries for English and French from `orgtre/top-open-subtitles-sentences`. RLS intentionally grants no browser read policy.
7. Deploy `supabase/functions/extract-vocabulary` and `supabase/functions/translate-word` after the secret is configured and test them using an authenticated account.

The schema and Auth-backed book/chapter path are live. The Edge Function is deployed separately from the frontend build; it remains unavailable until `GEMINI_API_KEY` is configured and an authenticated extraction has been verified.

## Git handoff

The canonical remote is `origin` at `https://github.com/Jules-Gossiaux/New_chapter_prep.git`. Work is developed on `codex/*` branches and merged into `main` through review. Before and after each task, inspect Git status. Commit only focused, verified changes with conventional commit messages, then push the feature branch when credentials and network access permit. Never commit API keys or book content.
