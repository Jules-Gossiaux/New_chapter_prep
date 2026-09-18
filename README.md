# ChapterPrep

ChapterPrep is a mobile-first, local-first web app for preparing vocabulary before reading in another language. Product scope is defined in [the PRD](docs/CHAPTERPREP_PRD.md).

## Quick start

```sh
npm install
npm run dev
```

Checks: `npm run build`, `npm test`, `npm run lint`, and `npm run format:check`.

The current branch contains the frontend product prototype: a navigable landing/auth flow, library, book and chapter workflow, extraction review, preparation mode, annotated reader, personal vocabulary list, direct word lookup, and book-scoped CSV export.

When `.env.local` contains a valid Supabase URL and publishable key, email/password authentication and user-owned book/chapter persistence use the configured Supabase project. The authenticated session is retained across browser refreshes and restores the user directly to their library. A configured but empty account shows an empty library, never the prototype books. Without that configuration, the application remains in explicit preview mode with demo fixtures.

The backend foundation under `supabase/` is applied to the hosted project: PostgreSQL tables/RLS, email/password Auth, and a server-only English/French frequency reference are live. Vocabulary extraction ranks words above the stored learner-level threshold, then sends only the selected contexts to Gemini for enrichment. The reader reloads candidates from the selected chapter’s latest completed extraction and can request an on-demand translation for another clicked word. No AI key is shipped to the browser. See [docs/VOCABULARY_EXTRACTION.md](docs/VOCABULARY_EXTRACTION.md) and [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Git workflow

Development happens on `codex/*` branches and is merged into `main` after verification. See [RULES.md](RULES.md) for the strict workflow and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local setup.
