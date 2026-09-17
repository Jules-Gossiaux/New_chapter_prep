# Engineering rules

- Preserve canonical chapter source text; generated vocabulary and annotations are separate records.
- Stay within the PRD: no FSRS, phone monitoring, OCR, backend, auth, billing, or full Anki `.apkg` claims without explicit scope.
- Use `codex/` feature branches and focused conventional commits when Git is available. Check status before and after work.
- Keep UI composition separate from domain validation, repositories, extraction providers, reader state, and export adapters.
- Add or update tests with behavior changes; cover empty/loading/error/recovery states.
- Never log full book contents. Preserve recoverable input on import/extraction failure.
- Version local storage keys and add migrations before changing persisted shapes; do not silently discard old data.
- Define ownership by directory before parallel work; never overwrite another agent's changes.
- Document architecture and product decisions in `docs/` when they change.
