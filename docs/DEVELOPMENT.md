# Development

Install Node.js and run `npm install`. Use `npm run dev` for the Vite server. Use `npm run build` for a production build. Keep changes focused and update docs for architectural decisions. The app currently has no backend or required environment variables.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Apply the SQL migration through the Supabase SQL Editor or Supabase CLI (`npx supabase db push` after linking the project).
4. Set `GEMINI_API_KEY` as an Edge Function secret; never put it in `.env.local` or frontend code.
5. Deploy `supabase/functions/extract-vocabulary` when the project is ready.

The checked-in migration and function are implementation foundations and have not been deployed against a live Supabase project yet.

## Git handoff

The canonical remote is `origin` at `https://github.com/Jules-Gossiaux/New_chapter_prep.git`. Work is developed on `codex/*` branches and merged into `main` through review. Before and after each task, inspect Git status. Commit only focused, verified changes with conventional commit messages, then push the feature branch when credentials and network access permit. Never commit API keys or book content.
