# Product brief

ChapterPrep helps A2–C1 language learners prepare focused, contextual vocabulary for the chapter they are about to read. Reading flow and learner control are primary. See [CHAPTERPREP_PRD.md](CHAPTERPREP_PRD.md) for full requirements.

## Current implementation direction

The next frontend milestone is a complete navigable product prototype with these surfaces: public landing page, sign in/sign up, library, book detail and chapters, add chapter, extraction settings/results, preparation, annotated reader, and vocabulary/export views. It will use mock data and local state where backend behavior is not yet available.

The planned extraction provider for the first backend integration is Gemini 2.5 Flash. Its API key must never be shipped to the browser; the frontend will call an application endpoint/provider boundary once the backend phase begins.

## Boundaries

Pasted text is first-class. In the frontend-only phase, TXT/EPUB/PDF parsing, real AI extraction, accounts, synchronization, and durable server persistence are represented as contracts or mocks. The UI must still preserve the original chapter text, allow review of suggestions, support the reader workflow, and make all unavailable behavior explicit.
