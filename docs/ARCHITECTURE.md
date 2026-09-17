# Architecture

The app is a React/Vite client with domain-first TypeScript modules:

- `domain.ts`: validated Book/Chapter models and creation rules.
- `persistence.ts`: `StoreRepository` and versioned localStorage implementation; future IndexedDB/cloud adapters can implement the same boundary.
- `extraction.ts`: provider contract isolated from UI; current provider fails safely.
- `main.tsx`: route/page composition for the initial slice only.
- `styles.css`: small responsive visual foundation.

Source chapter text is canonical and stored on `Chapter`; extraction runs, candidates, accepted chapter vocabulary, global entries, annotations, progress, and exports will be separate entities as those milestones land. Every extraction result must carry source chapter/run/config metadata. Local-first anonymous use is the selected default; account/sync remains an open decision.

## Feasibility note

Pasted text and `.txt` are low-risk. EPUB is feasible through a mature parser after representative fixtures and rights-safe handling are tested. Text PDFs require quality checks; scanned/OCR and complex layouts are out of scope. localStorage is adequate for this foundation but IndexedDB is the likely long-chapter upgrade. AI belongs behind `ExtractionProvider`, with redacted operational logs and explicit uncertainty. Sync can later add an authenticated repository and migrations without changing domain workflows.
