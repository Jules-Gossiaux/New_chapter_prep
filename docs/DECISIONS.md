# Decisions

## 2026-09-17 — Local-first React foundation

React + TypeScript + Vite provides a small responsive web/PWA-capable client with fast iteration and testable modules. localStorage keeps the core workflow usable without accounts; the repository interface leaves room for IndexedDB and sync. Zod validates external/user input. No backend, AI provider, or file parser is included before founder confirmation.

## 2026-09-17 — Frontend-first product prototype

The next build phase covers the complete navigable frontend workflow: public entry, auth screens, library, book/chapter management, extraction review, preparation, reader, vocabulary list, and export affordances. Backend calls, authentication, and Gemini responses are mocked or represented by explicit adapters. This keeps the UX testable without putting credentials or user book content at risk.

Gemini 2.5 Flash is the provisional first extraction provider, subject to backend privacy, quota, quality, and cost validation.

## 2026-09-18 — Supabase backend foundation

Supabase is the selected backend for the first real backend phase because it combines hosted PostgreSQL, Auth, row-level security, migrations, and Edge Functions in one junior-friendly workflow. The browser receives only the publishable key; Gemini credentials belong in Supabase Function secrets. The first backend slice supports email/password Auth, user-owned books and chapters, pasted text only, and a hard 500-word chapter limit.

No usage-plan limits are implemented yet. Provider failures and quota errors have stable error codes and user-safe messages so future free/gold/premium limits can be added without changing the UI contract.

## 2026-09-18 — Frequency-guided extraction

English and French extraction uses the top 10,000 OpenSubtitles frequency forms server-side. A book's stored learner level supplies a fixed initial cutoff, which the user may update from chapter setup. The Edge Function does deterministic token/rank filtering first and sends Gemini only selected sentence contexts. Chapters are guarded at 50,000 words rather than by the former model-context limit. The configured model is `gemini-3.5-flash-lite`: the predecessor returned a provider 404 and `gemini-3.6-flash` returned a high-demand response for this project.

## Open decisions

- PWA versus native/shared architecture.
- Anonymous local-first versus hybrid/account release.
- First-release language set.
- Whether PDF is launch-critical.
- AI privacy boundary, operating-cost limits, and final Gemini model/configuration.
- Product name.
- CSV sufficiency versus `.apkg` launch requirement.
