# Decisions

## 2026-09-17 — Local-first React foundation

React + TypeScript + Vite provides a small responsive web/PWA-capable client with fast iteration and testable modules. localStorage keeps the core workflow usable without accounts; the repository interface leaves room for IndexedDB and sync. Zod validates external/user input. No backend, AI provider, or file parser is included before founder confirmation.

## 2026-09-17 — Frontend-first product prototype

The next build phase covers the complete navigable frontend workflow: public entry, auth screens, library, book/chapter management, extraction review, preparation, reader, vocabulary list, and export affordances. Backend calls, authentication, and Gemini responses are mocked or represented by explicit adapters. This keeps the UX testable without putting credentials or user book content at risk.

Gemini 2.5 Flash is the provisional first extraction provider, subject to backend privacy, quota, quality, and cost validation.

## Open decisions

- PWA versus native/shared architecture.
- Anonymous local-first versus hybrid/account release.
- First-release language set.
- Whether PDF is launch-critical.
- AI privacy boundary, operating-cost limits, and final Gemini model/configuration.
- Product name.
- CSV sufficiency versus `.apkg` launch requirement.
