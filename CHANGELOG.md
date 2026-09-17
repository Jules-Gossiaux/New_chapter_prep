# Changelog

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
