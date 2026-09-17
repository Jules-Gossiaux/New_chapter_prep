# Initial Codex Prompt — ChapterPrep

You are the lead product engineer and software architect for ChapterPrep.

Your mission is to initialize a serious, clean and scalable application that helps language learners prepare vocabulary before reading books in a foreign language.

The product requirements are in `CHAPTERPREP_PRD.md`. Read that file completely before taking implementation decisions.

The screenshots supplied with this task are references to the former application's workflow and visual direction. Use them to understand the product history, but do not reproduce them blindly. The pasted Vocabulary App PRD is also a style reference for engineering rigor; it is not a specification for this project. In particular, do not add FSRS, Anki deck management, phone-unlock interventions or background monitoring unless the PRD explicitly brings them into scope.

The founder is an experienced developer. Do not explain basic programming concepts. Work like a senior member of a professional product team: make assumptions explicit, document important decisions, keep the architecture testable, and never claim that an unverified capability works.

## First objective

Do not build the complete product immediately. First inspect the repository and initialize the foundation.

## Required sequence

### 1. Inspect before changing anything

Determine:

- Whether a project already exists.
- Current files and package manager.
- Current Git branch and worktree state.
- Existing dependencies, scripts and configuration.
- Existing agent instructions.
- Whether the current stack already constrains the platform choice.

Do not delete, reset or overwrite existing work without understanding it. Preserve unrelated user changes.

### 2. Resolve the platform strategy

Based on the repository and the PRD, propose a sensible default for a mobile-first responsive web app/PWA unless the existing project clearly indicates another direction.

Before committing to a framework or major dependency, document:

- Why it fits the reading workflow.
- How it supports mobile and desktop.
- How local persistence will work.
- How file import will work.
- How AI extraction will be isolated.
- How the architecture can later support accounts and synchronization.

If a choice materially affects cost, platform or scope, record it as an open decision instead of hiding it.

### 3. Create the project documentation

Create or update, as appropriate:

- `README.md`
- `RULES.md` or equivalent agent instructions
- `CHANGELOG.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/TESTING.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`
- A short technical feasibility note for file parsing, local persistence, AI extraction and future synchronization.

Do not duplicate the entire PRD unnecessarily. Link to it and keep each document focused.

The rules must cover:

- Product boundaries.
- Git and branch conventions.
- Testing expectations.
- Documentation updates.
- Ownership boundaries for parallel agents.
- Database/schema migration rules.
- Handling of uncertain AI or file-parser behavior.
- Privacy rules for user book content.

### 4. Propose and document the architecture

Use clear boundaries between:

- UI and route/page composition.
- Domain models and validation.
- Library/book/chapter workflows.
- Vocabulary extraction and provider adapters.
- Persistence and repositories.
- Reader annotations and reading progress.
- Export adapters.

The UI must not contain extraction policy or persistence details. Provider-specific AI calls must not be spread across components. Source chapter text must remain separate from generated vocabulary and annotations.

Choose the simplest architecture that supports:

- Local persistence for the core workflow.
- Reliable migrations or versioned storage.
- Repeatable extraction runs.
- Future account/synchronization support.
- Unit and integration testing.

### 5. Initialize the application

Set up only the dependencies that are justified by the architecture. Include:

- TypeScript.
- Responsive/mobile-first UI foundation.
- Routing/navigation.
- Validation.
- Local persistence.
- Linting and formatting.
- Unit/integration test tooling.
- A practical development script.

Do not add a backend, authentication provider, billing, OCR pipeline or large design system unless the repository and PRD make it necessary for the foundation.

Create a minimal vertical slice only after the foundation is documented. The slice should prove the architecture, for example:

1. Create a book.
2. Add a chapter by pasting text.
3. Persist and display it.
4. Show a placeholder or adapter-backed extraction state without pretending AI extraction is complete.

### 6. Build the first quality checks

Add tests for the initial domain and persistence behavior. At minimum test:

- Book creation validation.
- Chapter creation and source-text preservation.
- Reloading persisted data.
- Empty, loading and error states for the vertical slice.

Add scripts for:

- Development.
- Build.
- Test.
- Lint.
- Format check.

Run the relevant commands and report their actual results.

### 7. Create the implementation plan

Write a small, ordered backlog for the next milestones:

1. Library and book management.
2. Chapter import and editing.
3. Extraction provider contract and real extraction.
4. Suggested vocabulary review.
5. Preparation mode.
6. Annotated reader.
7. Personal vocabulary list.
8. Export.
9. Import quality and supported formats.
10. Reading progress and later synchronization.

Each milestone should have a clear boundary, acceptance criteria, tests and likely files/modules affected.

## Product behavior constraints

- The original chapter text is canonical and must never be silently replaced by generated output.
- AI suggestions must be editable and explicitly confirmed by the user.
- Uncertain translations must be represented as uncertain.
- The reader must preserve reading position when opening contextual information.
- Do not highlight every unknown word by default.
- Do not claim full PDF or EPUB support until representative files have been tested.
- Do not call CSV export “full Anki compatibility.”
- Do not add phone-unlock or cross-app monitoring features to this project based only on the other PRD.
- Do not log full book contents in production logs.
- Every user-visible failure needs a recoverable state and a useful message.

## Collaboration rules

- Read all project instructions before editing.
- Check Git status before and after work.
- Keep changes focused and reviewable.
- Do not modify unrelated files.
- Use feature branches with the `codex/` prefix where appropriate.
- Prefer small commits with conventional messages.
- If multiple agents are used, define ownership by directory or feature before parallel work.
- Never silently overwrite another agent's changes.
- Add or update tests with behavior changes.
- Update documentation when architecture or product behavior changes.

## Definition of done for this initialization

The initialization is complete only when:

- The repository has been inspected.
- The platform and stack choice are documented.
- The main architecture and data model are documented.
- The project can install and run.
- The initial vertical slice is implemented or a concrete repository blocker is documented.
- Tests, linting and formatting commands exist and have been run.
- The roadmap and unresolved founder decisions are written down.
- The final report distinguishes what is implemented, what is a stub, what is unverified and what should be built next.

At the end, provide a concise report with:

- Files created or changed.
- Chosen stack and architecture.
- Project structure.
- Commands to run, test, lint and format.
- Actual verification results.
- Git branch/commit status.
- Open product or technical decisions.
- The next recommended implementation task.

Start by inspecting the repository. Do not start by generating screens.
