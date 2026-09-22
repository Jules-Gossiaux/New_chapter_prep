# ChapterPrep — Product Requirements Document

## Document status

- **Status:** Product definition for initial implementation
- **Version:** 1.0
- **Date:** 2026-09-17
- **Product type:** Mobile-first web application, installable as a PWA when practical
- **Working name:** ChapterPrep

## 1. Product summary

ChapterPrep helps language learners read real books in a foreign language with less friction.

The user imports a book or adds chapters, selects their current language level and target language, and receives a focused vocabulary preparation list for the next chapter. They study the words before reading, then read the chapter in an annotated reading mode with translation and contextual help available when needed.

The product is not a generic flashcard app, a full language course, or an AI chatbot. Its core promise is:

> Prepare the vocabulary for the text you are about to read, so you can read more fluently and confidently.

The previous application already validated the basic workflow: books, chapters, level-based extraction, suggested words, a personal word list, annotated reading, translation, and Anki export. The new version should keep that validated workflow while improving information architecture, mobile usability, reliability, accessibility, visual hierarchy, and product quality.

## 2. Problem

Learners often want to read books in their target language but stop repeatedly to look up words. This breaks comprehension and makes reading feel harder than it should.

Existing solutions create one of two problems:

- Generic vocabulary lists are disconnected from the text the learner wants to read.
- Reading tools provide translation only after the learner is already blocked.

The product should move useful vocabulary preparation before the reading session, while preserving the original chapter context.

## 3. Target users

### Primary user

A motivated language learner, approximately A2–C1, who wants to read books, essays or long-form texts in a target language.

Typical characteristics:

- Has a known or approximate CEFR level.
- Reads on a phone or laptop.
- Wants help with difficult vocabulary, not a complete translation of every sentence.
- May already use Anki or another spaced-repetition tool.
- Values reading flow and practical context over gamification.

### Secondary users

- Learners preparing for an exam through authentic texts.
- Teachers or tutors preparing reading material.
- Bilingual readers studying several target languages.

## 4. Product principles

1. **Reading comes first.** Every feature should help the user reach and understand the next chapter.
2. **Context beats isolated vocabulary.** Words are selected and explained in relation to the imported text.
3. **The learner stays in control.** AI suggestions are editable and never silently become the user's vocabulary list.
4. **Useful density, not maximal extraction.** A short, relevant list is better than hundreds of low-value words.
5. **Fast and calm UX.** The interface should feel focused, readable and trustworthy.
6. **Transparent AI.** The app must communicate when a result is generated, editable, uncertain or incomplete.
7. **Export and ownership.** Users can keep their vocabulary outside the product.
8. **Privacy by default.** Imported books and reading data should not be exposed unnecessarily.

## 5. Core user journey

```text
Create account or continue locally
        ↓
Create a book or import a supported document
        ↓
Set target language, native language and CEFR level
        ↓
Add or import a chapter
        ↓
Review extraction settings and suggested vocabulary
        ↓
Accept, remove or manually add words
        ↓
Study the preparation list
        ↓
Read the chapter in annotated mode
        ↓
Click a word for translation, meaning and context
        ↓
Save words and optionally export to Anki
```

## 6. MVP scope

### 6.1 Library and books

Users can:

- View a library of books.
- Create a book manually with title, author and target language.
- Import a supported text document, with PDF support implemented only if extraction quality is acceptable.
- Open a book detail page showing chapters, progress and vocabulary preparation status.
- Rename or delete a book with confirmation.

The MVP must not claim to support every PDF. Scanned PDFs, complex layouts and DRM-protected files should be identified as unsupported or handled through a documented fallback.

### 6.2 Chapters

Users can:

- Add a chapter by pasting text or importing a supported file.
- Set chapter number, title and reading level.
- Edit chapter text before extraction.
- Re-run extraction after meaningful text or settings changes.
- Open a chapter in preparation mode or reading mode.
- See whether vocabulary extraction is pending, complete or failed.

Chapter text must be preserved separately from generated annotations so that extraction can be repeated without losing the original content.

### 6.3 Learner profile and language settings

The MVP supports:

- Native language.
- Target language per book.
- CEFR level: A1, A2, B1, B2, C1, C2.
- Preferred translation direction.
- Optional preference for showing lemmas or surface forms.

The level is a selection signal, not a guarantee of objective word difficulty. The UI should explain that vocabulary difficulty is an estimate.

### 6.4 Vocabulary extraction

The extraction flow should:

- Detect the source language and validate it against the book settings.
- Count words and provide a rough text-size indicator.
- Identify candidate words and multi-word expressions.
- Exclude obvious stop words, punctuation, duplicates and common inflections when appropriate.
- Use the learner's CEFR level to prioritize words at or above the configured threshold.
- Preserve the original occurrence and sentence context.
- Produce a translation or concise meaning in the learner's native language.
- Indicate uncertainty when the meaning is ambiguous.
- Allow the user to set a target number or density of words.
- Allow the user to accept, reject and edit suggestions before saving.

The output is a recommendation, never an irreversible action.

### 6.5 Vocabulary preparation

Before reading, the learner can view a preparation list containing:

- Word or expression.
- Lemma and surface form where relevant.
- Translation or meaning.
- Part of speech when available.
- Example sentence or chapter context.
- Optional pronunciation or audio only if it can be implemented reliably.
- Familiarity state: new, learning, known or ignored.

The preparation experience should support quick review without turning the MVP into a complete spaced-repetition product.

### 6.6 Annotated reading mode

The reader should:

- Display the original chapter with comfortable typography and adjustable text size.
- Highlight words selected for preparation.
- Preserve paragraphs, headings and basic emphasis where possible.
- Let the learner tap or click a highlighted word.
- Open a lightweight contextual panel with translation, meaning, word form and save/remove actions.
- Avoid interrupting the reading position.
- Support a clean reading mode with the vocabulary panel collapsed.
- Work well on mobile widths and larger screens.

The reader must not visually highlight every difficult word by default. The selected vocabulary should remain the primary signal.

### 6.7 Personal vocabulary list

Users can:

- View saved words across books.
- Filter by book, chapter, target language and status.
- Edit translations and notes.
- Remove a word from their list.
- Open the source context.
- Export selected words.

### 6.8 Anki export

The current export supports CSV, TXT and a browser-generated `.apkg` package.
The package contains one Basic-style deck with Word, Translation and optional
Example fields. Full Anki import and review synchronization remain out of
scope; the export contract documents fields, escaping, duplicates and supported
card content.

### 6.9 Accounts and persistence

The initial product should choose one of these implementation strategies explicitly during initialization:

- Local-first anonymous use with optional account creation later; or
- Account-based persistence from the first version.

The preferred MVP direction is local-first or hybrid: the main reading workflow should remain usable without a complex backend, while the data model should allow future synchronization.

If authentication is implemented in the first version, it should be limited to the smallest useful flow and must not delay the core reading workflow.

## 7. Important screens

### Public landing page

Purpose: explain the promise and invite the user to start.

Content:

- Clear value proposition.
- Three-step explanation: import, prepare, read.
- Short problem statement.
- Feature summary.
- Privacy and supported formats note.
- Start CTA and login CTA if accounts exist.

### Library

Purpose: show the user's books and next action.

Content:

- Continue reading card.
- Book cards with title, author, language and chapter progress.
- Create book action.
- Import action.
- Empty state with one obvious first action.

### Book detail

Purpose: manage and navigate a book.

Content:

- Title, author, target language and progress.
- Chapter list.
- Chapter status: not prepared, preparation ready, in progress, completed.
- Add chapter and import chapter actions.

### Add/import chapter

Purpose: get clean chapter text into the system.

Content:

- Chapter title/number.
- Paste or upload input.
- Text preview and editing.
- Language and learner level settings.
- Word count.
- Extraction settings.
- Clear save/extract action.

PDF import is limited to text-based PDFs in the first version. Scanned PDFs or
PDFs without extractable text must show a clear error; OCR is out of scope.
Import uses a full book-creation page with the PDF filename as the default
title, plus the regular author, language and learner-level fields. After text
extraction, the user chooses a target chapter size between 200 and 3000 words.
The chapter count updates live as the target changes. Chapter boundaries are
created automatically, preferring the last paragraph before the target size and
falling back to the nearest sentence when a paragraph is too long. Imported
chapters are saved as unprocessed chapters; the existing chapter preparation
choices are shown when the user selects Process chapter. The target size is
applied to the complete extracted text, including page-sized PDF text blocks,
so changing the slider immediately changes the chapter count and the chapters
created on import. Once vocabulary extraction succeeds, the chapter is marked
ready and is not offered for processing again unless its content is edited.
When processing a chapter, its language and learner level can override the
book defaults and are persisted with the chapter.

### Suggested vocabulary review

Purpose: give the learner control over AI output.

Content:

- Candidate list with checkboxes.
- Word, translation, context and confidence/ambiguity indicator.
- Search and manual add.
- Select all / clear all.
- Confirm selection.

### Preparation session

Purpose: preview the vocabulary before reading.

Content:

- Progress through the list.
- Word and meaning.
- Context sentence.
- Reveal or self-assessment interaction kept simple.
- Start reading CTA.

### Reader

Purpose: read the chapter with contextual support.

Content:

- Original text.
- Selected vocabulary highlights.
- Translation/context panel.
- Reading progress.
- Text-size and display controls.
- Save/remove word action.

### Vocabulary list

Purpose: revisit and export saved vocabulary.

Content:

- Search, filters and sorting.
- Word cards with context.
- Edit and remove actions.
- Export action.

Vocabulary export opens a live preview where the user can edit the output,
choose CSV or TXT, include or omit examples, select a comma, semicolon, tab or
custom separator, copy the result, or download it. A selected book filter
limits the export to that book's vocabulary. The export also supports a valid
Anki `.apkg` package with a deck named after the selected book (or chapter),
using the word as the front and translation/context as the back.

The book detail page provides Chapters and Vocabulary tabs. The Vocabulary tab
uses the same list, search, removal and export behavior scoped to that book.
The reader exposes direct CSV and Anki exports scoped to the current chapter.

## 8. UX and visual direction

The previous application used a warm off-white background, dark green primary actions, white cards, rounded borders, large readable typography and restrained shadows. This direction is useful and should evolve into a more polished system.

Requirements:

- Mobile-first responsive layout.
- Strong reading typography and generous line height.
- Consistent spacing and component tokens.
- Accessible contrast and visible keyboard focus.
- Touch targets appropriate for mobile.
- Clear loading, empty, error and success states.
- Avoid excessive gradients, animation and decorative UI.
- Use progressive disclosure for extraction settings and advanced metadata.
- Do not make important actions depend only on color.

The visual system should be documented in a small design-system file or component catalog before the interface grows significantly.

## 9. Functional requirements

### FR-1 — Create a book

Given valid title and target language, the user can create a book and see it in the library.

### FR-2 — Add a chapter

Given valid chapter text, the user can save a chapter under a book with number/title metadata.

### FR-2a — Import a text PDF

Given a text-based PDF and a target chapter size between 200 and 3000 words, the system extracts the text, splits it into ordered chapters at paragraph or sentence boundaries, and saves those chapters as unprocessed. Scanned or otherwise non-extractable PDFs are rejected with a recoverable error.

### FR-2b — Detect imported language

When a user imports a PDF or pastes chapter text, the application detects a
supported source language and uses it as the initial book or chapter language.
The user can review and override the detected value before saving or processing.

### FR-3 — Preserve source text

The exact normalized source text must remain recoverable even if generated vocabulary or annotations are edited.

### FR-4 — Extract vocabulary

The system can request an extraction for a chapter using the configured language, learner level and extraction density.

### FR-5 — Review suggestions

The user can accept, reject, edit and manually add candidates before they become chapter vocabulary.

### FR-6 — Read with annotations

The user can open a saved chapter and identify selected vocabulary in context.

### FR-7 — Contextual lookup

Selecting a vocabulary item opens its translation and source context without losing reading position.

### FR-8 — Save and edit vocabulary

The user can save a word globally, edit its meaning/notes and remove it later.

### FR-9 — Export

The user can preview and edit an export, choose CSV, TXT or Anki `.apkg`
formatting, optionally include examples, copy text exports, and download it.
When a book or chapter scope is selected, only vocabulary linked to that scope
is exported.

### FR-10 — Process imported chapters explicitly

Imported chapters remain unprocessed until the user selects the existing chapter preparation action from the Chapters view.

### FR-11 — Configure a chapter independently

When processing an existing chapter, the user can change its target language and
learner level independently from the book defaults. The selected values are
saved before vocabulary extraction and are used by the extraction service.

### FR-12 — Delete an account

An authenticated user can permanently delete their account from Settings after
confirming their password. The operation removes the Auth user and cascades to
the user's books, chapters, vocabulary and reading data. The service-role key
must remain server-side in a protected Edge Function.

### FR-13 — Recover from failure

Extraction, import and persistence failures must show a useful error and preserve recoverable user input.

## 10. Non-functional requirements

- Works at mobile widths first and remains usable on desktop.
- Keyboard accessible for all core flows.
- Core reading views should feel fast after initial load.
- User content must not be lost on refresh or failed extraction.
- Long chapters must not cause the reader to render thousands of independent heavy components unnecessarily.
- All generated content must be traceable to its source chapter and extraction run.
- Privacy-sensitive content should not be logged in plaintext by default.
- The application must have automated tests for domain logic, extraction normalization, persistence and critical user flows.
- Errors must be observable in development without leaking book contents.

## 11. Data model proposal

The exact schema should be finalized in an architecture document, but the conceptual entities are:

- `User` or local profile.
- `Book`.
- `Chapter`.
- `ExtractionRun`.
- `VocabularyCandidate`.
- `ChapterVocabulary`.
- `VocabularyEntry`.
- `ReadingProgress`.
- `ExportJob` or export record.

Important relationships:

- A book has many chapters.
- A chapter has one canonical source text and many extraction runs.
- An extraction run has many candidates and a model/configuration snapshot.
- Accepted candidates become chapter vocabulary and may link to a global vocabulary entry.
- A vocabulary entry can occur in many chapters.
- Reading progress is separate from extraction and vocabulary state.

Every generated result should store enough metadata to explain when, with which settings and from which source it was produced.

## 12. AI and extraction policy

AI may assist with candidate selection, level estimation, translation, lemmatization and context-aware explanations.

AI must not:

- Rewrite the chapter without explicit user action.
- Hide the original text.
- Silently delete candidates.
- Present uncertain translations as certain facts.
- Be required for basic library navigation or reading previously prepared content.

The extraction interface should make the following visible where relevant:

- Processing state.
- Number of words analyzed.
- Number of candidates returned.
- Extraction configuration.
- Failure and retry state.
- Limits or quota.

The provider and prompt strategy should be abstracted behind an application service so that providers can change without coupling UI code to one API.

## 13. Import and file support

Initial support should prioritize formats that can be parsed reliably:

1. Pasted plain text.
2. `.txt`.
3. `.epub` if a mature parser and rights-safe workflow are available.
4. Text-based `.pdf` only after quality validation.

Scanned PDF OCR, DRM bypass, layout-perfect book reconstruction and automatic chapter segmentation are explicitly outside the first implementation unless separately approved.

## 14. Testing strategy

### Unit tests

- Text normalization.
- Tokenization and phrase grouping.
- Duplicate and inflection handling.
- CEFR filtering/priority rules.
- Extraction response validation.
- Candidate acceptance/rejection.
- Export escaping, deterministic output and valid Anki package structure.
- Reading-progress calculations.
- Data validation.

### Integration tests

- Book and chapter persistence.
- Extraction run persistence.
- Candidate selection to saved vocabulary.
- Reader annotations from chapter vocabulary.
- Export from stored entries.

### UI tests

Cover at least:

- Create a book.
- Add a chapter.
- Review and confirm suggestions.
- Open preparation mode.
- Open reader and select a word.
- Edit/remove a saved word.
- Export vocabulary.
- Export vocabulary from a book and from a chapter.
- The book and chapter export actions use the same export controls and support
  CSV, TXT and Anki `.apkg`; Anki exports never include context examples.
- Anki exports let the learner choose cards in the word-to-translation direction,
  the translation-to-word direction, or both directions.
- The reader text-size controls clearly indicate decrease/increase actions and
  do not include a redundant middle control.
- The application sidebar keeps Settings and the account control fixed at the
  bottom of the viewport; the account menu opens upward without requiring a
  second scroll.
- Deleting a book also removes vocabulary entries that are no longer linked to
  any other book, while preserving shared vocabulary.
- Chapter numbers are assigned automatically using the lowest available number;
  users do not enter chapter numbers manually.
- Detect language for pasted/imported text.
- Show the detected language in chapter forms and warn when the selected
  language differs; require an explicit confirmation before vocabulary
  processing continues in that situation.
- Confirm account deletion with an incorrect and a correct password.
- Recover from an extraction error.

### Acceptance criteria

No feature is considered complete if it only works on the happy path. The relevant empty, loading, error, mobile and keyboard states must be addressed.

## 15. MVP non-goals

- Full Duolingo-style curriculum.
- Social feeds, leaderboards or competitive gamification.
- Full `.apkg` compatibility unless separately scoped.
- Perfect CEFR classification for every word.
- Automatic copyright acquisition or book catalog browsing.
- OCR for arbitrary scanned books.
- Native mobile unlock interception.
- Background monitoring of other applications.
- A general-purpose AI tutor.
- Audio generation or speech recognition unless explicitly added as a separate milestone.

## 16. Roadmap

### Phase 0 — Foundation

- Confirm product decisions and supported platforms.
- Inspect repository and existing tooling.
- Establish design tokens and information architecture.
- Create documentation, CI and test setup.

### Phase 1 — Core reading workflow

- Library and books.
- Chapters and source-text persistence.
- Manual vocabulary selection.
- Extraction service abstraction.
- Suggested vocabulary review.
- Annotated reader.
- Personal vocabulary list.
- Basic export.

### Phase 2 — Quality and retention

- Better extraction evaluation.
- Preparation review mode.
- Reading progress and chapter completion.
- Improved PDF/EPUB support.
- Import/export improvements.
- Usage analytics with privacy safeguards.

### Phase 3 — Spaced repetition and integrations

- Optional spaced-repetition review of chapter vocabulary.
- More complete Anki interoperability.
- Account and synchronization.
- Cross-device reading progress.

### Phase 4 — Advanced learning

- Context exercises.
- AI-generated examples with user control.
- Audio and pronunciation.
- Personalized difficulty adaptation.
- Teacher workflows.

## 17. Decisions requiring founder confirmation

The initialization agent should identify these explicitly rather than silently deciding them:

1. Web/PWA first, native mobile first, or a shared architecture supporting both?
2. Is the first release anonymous/local-first, account-based, or hybrid?
3. Which languages must be supported in the first release?
4. Is PDF import required for the first public version, or can pasted text and TXT/EPUB come first?
5. Which AI provider and operating-cost limits apply?
6. Should the product keep the name ChapterPrep or use a new name?
7. Is basic CSV export sufficient for MVP, or is `.apkg` import/export a launch requirement?

## 18. Reference material interpretation

The screenshots show the former product's validated concepts: landing page, book library, book detail, chapter creation, extraction settings, suggested-word confirmation, reader annotations, translation panel and export. They are references for workflow and visual tone only. The implementation should improve the information architecture, responsive behavior, accessibility, states and data integrity instead of reproducing their exact layout.

The pasted Vocabulary App PRD is a reference for the founder's preferred working style and engineering rigor. Its instructions about Anki, FSRS, decks and phone-unlock interventions belong to that other project and must not be imported into this product unless a requirement above explicitly adopts them.
