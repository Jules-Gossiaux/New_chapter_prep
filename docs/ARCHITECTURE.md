# Architecture

The app is a React/Vite client with domain-first TypeScript modules:

- `domain.ts`: validated Book/Chapter models and creation rules.
- `persistence.ts`: `StoreRepository` and versioned localStorage implementation; future IndexedDB/cloud adapters can implement the same boundary.
- `extraction.ts`: provider contract isolated from UI; current provider fails safely.
- `main.tsx`: route/page composition for the frontend prototype and its UI state transitions.
- `styles.css`: small responsive visual foundation.

The complete frontend prototype intentionally uses `app-model.ts` demo fixtures for reviewable UX. The initial `domain.ts` and `persistence.ts` modules are foundation seams, not yet wired to the prototype screens. The backend phase will replace those fixtures with repositories and provider calls without changing the page contracts.

## Backend foundation

`supabase/migrations/202609180001_initial_schema.sql` defines profiles, user-owned books, chapters, extraction runs, candidates, vocabulary entries, chapter links, and reading progress. RLS policies scope data to `auth.uid()` and chapter/book ownership. `supabase/functions/extract-vocabulary/index.ts` validates authentication and the 500-word limit, calls `gemini-2.5-flash` server-side, requests JSON output, and returns stable error codes for authentication, validation, provider, and quota failures.

`src/lib/supabase.ts` is configuration-safe: the app remains in preview mode without `.env.local`. `src/lib/auth.ts` uses Supabase email/password Auth when configured and retains a clearly labelled preview fallback otherwise.

Source chapter text is canonical and stored on `Chapter`; extraction runs, candidates, accepted chapter vocabulary, global entries, annotations, progress, and exports will be separate entities as those milestones land. Every extraction result must carry source chapter/run/config metadata. Local-first anonymous use is the selected default; account/sync remains an open decision.

## Feasibility note

Pasted text and `.txt` are low-risk. EPUB is feasible through a mature parser after representative fixtures and rights-safe handling are tested. Text PDFs require quality checks; scanned/OCR and complex layouts are out of scope. localStorage is adequate for this foundation but IndexedDB is the likely long-chapter upgrade. AI belongs behind `ExtractionProvider`, with redacted operational logs and explicit uncertainty. Sync can later add an authenticated repository and migrations without changing domain workflows.

`src/lib/books.ts` and `src/lib/extraction.ts` are the client-side application boundaries for the next integration step. They validate the chapter limit, map database rows, invoke the function, and preserve stable error names without spreading Supabase details across components.
