# Development

Install Node.js and run `npm install`. Use `npm run dev` for the Vite server. Use `npm run build` for a production build. Keep changes focused and update docs for architectural decisions. The official Supabase Codex plugin is installed locally; see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the required restart, OAuth and verification status.

## Supabase setup

1. The hosted project `New_chapter_prep` (`auubivhhifkasnlsmine`, `eu-west-1`) is active and reachable through Supabase MCP.
2. The initial schema, RLS hardening, trigger permission, vocabulary-extraction, and book-reading/covers migrations are applied. Verify changes through Supabase MCP before adding another migration.
3. `.env.local` is local-only and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite after changing either value.
4. Email/password Auth and book/chapter persistence are live when the user is signed in. A new account has an empty library until it creates a book.
5. Set `GEMINI_API_KEY` as an Edge Function secret; never put it in `.env.local` or frontend code. The dashboard path is Project Settings → Edge Functions → Secrets.
6. `vocabulary_frequency` is server-only and currently contains the top 10,000 source entries for English and French from `orgtre/top-open-subtitles-sentences`. RLS intentionally grants no browser read policy.
7. Deploy `supabase/functions/extract-vocabulary` and `supabase/functions/translate-word` after the secret is configured and test them using an authenticated account.

`supabase/migrations/20260926113007_book_reading_status_and_covers.sql` creates the private `book-covers` Storage bucket, owner-scoped policies, and the `books.cover_path` column. It has been applied to the hosted project. The code does not create the bucket automatically; apply the migration to any other Supabase environment before testing cover uploads.

The schema and Auth-backed book/chapter path are live. The Edge Function is deployed separately from the frontend build; it remains unavailable until `GEMINI_API_KEY` is configured and an authenticated extraction has been verified.

## Personal hosted deployment

The personal production frontend is hosted on Vercel at `https://newchapterprep.vercel.app`. The Vercel project uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Production and Preview environment variables. The publishable key is expected in a browser build; never add a Supabase secret or `service_role` key to a `VITE_` variable.

To deploy a new frontend version from an authenticated local machine:

```sh
npx vercel login
npx vercel --prod
```

The Supabase Edge Functions are deployed separately:

```sh
npx supabase functions deploy --project-ref auubivhhifkasnlsmine --use-api --yes
```

The Vercel project is currently deployed through the CLI rather than an automatic GitHub connection. The Supabase Auth site URL and redirect URLs are declared in `supabase/config.toml`; apply them with `npx supabase config push --project-ref auubivhhifkasnlsmine` only after reviewing `npx supabase config diff --project-ref auubivhhifkasnlsmine`.

## Git handoff

The canonical remote is `origin` at `https://github.com/Jules-Gossiaux/New_chapter_prep.git`. Work is developed on `codex/*` branches and merged into `main` through review. Before and after each task, inspect Git status. Commit only focused, verified changes with conventional commit messages, then push the feature branch when credentials and network access permit. Never commit API keys or book content.
