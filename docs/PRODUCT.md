# Product brief

ChapterPrep helps A2–C1 language learners prepare focused, contextual vocabulary for the chapter they are about to read. Reading flow and learner control are primary. See [CHAPTERPREP_PRD.md](CHAPTERPREP_PRD.md) for full requirements.

## Current implementation direction

The next frontend milestone is a complete navigable product prototype with these surfaces: public landing page, sign in/sign up, library, book detail and chapters, add chapter, extraction settings/results, preparation, annotated reader, and vocabulary/export views. It will use mock data and local state where backend behavior is not yet available.

The planned extraction provider for the first backend integration is Gemini 2.5 Flash. Its API key must never be shipped to the browser; the frontend will call an application endpoint/provider boundary once the backend phase begins.

## Frontend prototype behavior

The prototype uses three coherent sample books and representative candidate words so the full journey can be evaluated without a server. The auth form creates a simulated local session. Chapter extraction transitions to representative AI suggestions. Candidate selection leads to preparation, then the reader supports selected-word contextual panels, save/remove behavior, font-size controls, and CSV download.

Every word in the reader is also a lookup target. Prepared words retain the primary highlight treatment; other words use a lighter interaction treatment and open the same contextual panel. The current frontend uses a small local translation fixture for representative words and clearly marks unknown translations as pending backend lookup.

## Boundaries

Pasted text is first-class. In the frontend-only phase, TXT/EPUB/PDF parsing, real AI extraction, accounts, synchronization, and durable server persistence are represented as contracts or mocks. The UI must still preserve the original chapter text, allow review of suggestions, support the reader workflow, and make all unavailable behavior explicit.
