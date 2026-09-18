# Architecture

The app is a React/Vite client with domain-first TypeScript modules:

- `domain.ts`: validated Book/Chapter models and creation rules.
- `persistence.ts`: `StoreRepository` and versioned localStorage implementation; future IndexedDB/cloud adapters can implement the same boundary.
- `extraction.ts`: provider contract isolated from UI; current provider fails safely.
- `main.tsx`: route/page composition for the frontend prototype and its UI state transitions.
- `styles.css`: small responsive visual foundation.

`app-model.ts` still provides fixtures for explicit preview mode and unfinished extraction/vocabulary surfaces. When Supabase is configured, `main.tsx` loads the authenticated user's books and chapters through `src/lib/books.ts`; an empty remote library renders an empty state rather than demo content. Selecting a persisted chapter loads only the candidates from its newest completed extraction before opening the reader with canonical `source_text`. The same repository boundary owns book/chapter deletion; database foreign keys cascade related chapter data. The initial `domain.ts` and `persistence.ts` modules remain local-first foundation seams.

## Backend foundation

`supabase/migrations/202609180001_initial_schema.sql` defines profiles, user-owned books, chapters, extraction runs, candidates, vocabulary entries, chapter links, and reading progress. `supabase/migrations/20260918165240_vocabulary_extraction.sql` raises the chapter safety limit to 50,000 words and adds `vocabulary_frequency`, an RLS-protected reference table that clients cannot read. Its first 10,000 English and French frequency entries come from OpenSubtitles2018 via `orgtre/top-open-subtitles-sentences`.

`supabase/functions/extract-vocabulary/index.ts` verifies the caller owns the chapter, looks up its tokens in the reference table in indexed batches, and selects only ranks above the fixed learner-level cutoff (A1: 800 through C2: 10,000). It orders candidates from the closest useful rank upward, limits them to the requested maximum of 1–50, and sends Gemini only the selected sentence contexts. The function persists the run and candidates; it returns stable errors for authentication, validation, provider, and quota failures.

`src/lib/supabase.ts` is configuration-safe: the app remains in preview mode without `.env.local`. Its explicit browser auth settings persist and refresh the Supabase session; app bootstrap restores a valid session to the library. `src/lib/auth.ts` uses Supabase email/password Auth when configured and retains a clearly labelled preview fallback otherwise. `src/lib/books.ts` requires an authenticated user before querying or mutating user-owned data.

Source chapter text is canonical and stored on `Chapter`; extraction runs, candidates, accepted chapter vocabulary, global entries, annotations, progress, and exports will be separate entities as those milestones land. Every extraction result must carry source chapter/run/config metadata. Local-first anonymous use is the selected default; account/sync remains an open decision.

## Feasibility note

Pasted text and `.txt` are low-risk. EPUB is feasible through a mature parser after representative fixtures and rights-safe handling are tested. Text PDFs require quality checks; scanned/OCR and complex layouts are out of scope. localStorage is adequate for this foundation but IndexedDB is the likely long-chapter upgrade. AI belongs behind `ExtractionProvider`, with redacted operational logs and explicit uncertainty. Sync can later add an authenticated repository and migrations without changing domain workflows.

`src/lib/books.ts` and `src/lib/extraction.ts` are the client-side application boundaries for the next integration step. They validate the chapter limit, map database rows, invoke the extraction and direct-translation functions, and preserve stable error names without spreading Supabase details across components. `translate-word` verifies the caller owns the requested chapter, derives a short context server-side, and sends only that word/context pair to Gemini.
