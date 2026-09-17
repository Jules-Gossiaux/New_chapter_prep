# Engineering rules

## Product boundaries

- Preserve canonical chapter source text; generated vocabulary and annotations are separate records.
- Stay within the PRD: no FSRS, phone monitoring, OCR, backend, billing, or full Anki `.apkg` claims without explicit scope. Authentication screens may be prototyped in the frontend, but authentication is not functional until a backend exists.
- The current implementation phase is frontend-first. Use realistic mock state and explicit loading/error/empty states; never present mocked AI output or authentication as production functionality.
- Keep UI composition separate from domain validation, repositories, extraction providers, reader state, and export adapters.
- Add or update tests with behavior changes; cover empty/loading/error/recovery states.
- Never log full book contents. Preserve recoverable input on import/extraction failure.
- Version local storage keys and add migrations before changing persisted shapes; do not silently discard old data.
- Define ownership by directory before parallel work; never overwrite another agent's changes.
- Document architecture and product decisions in `docs/` when they change.

## Strict Git workflow

- Start every task with `git status --short --branch` and `git remote -v`; inspect existing changes before editing.
- Work on a branch named `codex/<short-scope>` based on `main`. Keep one logical change per commit and use a conventional message such as `feat: add reader shell` or `docs: record frontend scope`.
- Run the relevant build, test, lint, and format checks before committing. The commit message and final report must distinguish verified behavior from stubs and unverified behavior.
- After committing, push the feature branch with `git push -u origin <branch>` when the remote is available. Do not force-push, reset, overwrite user changes, or commit directly to `main`.
- Never commit secrets, API keys, book contents used as private fixtures, generated build output, or local credentials. A pull request or explicit founder review is required before merging to `main`.
- End every task with `git status --short --branch`, the commit hash, verification results, and any push/remote limitation.
