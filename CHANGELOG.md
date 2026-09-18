# Changelog

## 0.4.1 — Extraction recovery

- Updated the Gemini model from retired `gemini-2.5-flash` to `gemini-3.6-flash` after the provider returned a 404.
- Made the chapter-level selector editable and persisted level changes to the associated Supabase book.
- Surface structured Edge Function error messages in the browser instead of a generic non-2xx status.

## 0.4.0 — Frequency-guided vocabulary extraction

- Added a server-only OpenSubtitles frequency reference for the top 10,000 English and French forms, with source rank and count.
- Raised the chapter import safety limit to 50,000 words and made the chapter control a 1–50 absolute suggestion maximum.
- Replaced full-chapter AI prompting with deterministic level-aware candidate selection and context-only Gemini enrichment.
- Persisted extraction runs and candidates, including frequency metadata, and added a focused-list notice for chapters with more than 50 eligible words.

## 0.1.0 — Foundation

- Added React/Vite/TypeScript foundation.
- Added local-first book and chapter vertical slice.
- Added Zod validation, versioned localStorage repository, extraction boundary, tests, lint and formatting scripts.

## 0.2.0 — Frontend product prototype

- Added a complete navigable frontend workflow: landing, auth preview, library, book detail, chapter setup, extraction review, preparation, reader, vocabulary, and CSV export affordance.
- Added responsive editorial design system and mock AI disclosure for provisional Gemini 2.5 Flash integration.

## 0.2.1 — Frontend consistency fixes

- Added a dedicated new-book flow instead of opening the currently selected book.
- Made Vocabulary counts reflect the saved words shown in the prototype.
- Made highlighted reader words explicitly clickable and connected to contextual translation panels.
- Added functional book/sort filters and scoped vocabulary CSV export.
- Connected the extraction word-count control to the number of selected suggestions.

## 0.2.2 — Direct reader lookup

- Made every word in the reader clickable, while keeping prepared vocabulary visually highlighted.
- Added contextual translation panels for prepared words and representative direct-lookup entries.
- Extended saved-word rendering and CSV export to include words looked up directly in the reader.

## 0.3.0 — Backend foundation

- Added Supabase configuration, environment template, email/password Auth wiring, typed book/chapter repository boundaries, and an extraction invocation boundary.
- Added the initial PostgreSQL schema with RLS policies for profiles, books, chapters, extraction runs, candidates, vocabulary, and reading progress.
- Added a server-side Gemini 2.5 Flash Edge Function with authentication checks, JSON output handling, quota errors, and the 500-word chapter limit.

## 0.3.1 — Supabase library integration

- Applied and hardened the initial Supabase schema, including RLS policy and trigger-permission fixes.
- Connected email/password Auth and user-owned book/chapter repositories to the library workflow.
- Removed hard-coded prototype books from the configured Supabase path; empty accounts now receive an empty-library state.
- Opened persisted chapters in the reader with their actual source text and made the new-chapter form choose the next available chapter number.
