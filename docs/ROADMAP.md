# Roadmap

0. Frontend product prototype — navigable landing/auth/library/book/chapter/extraction/preparation/reader/vocabulary surfaces with mock states and responsive design.
1. Library and book management — CRUD, confirmation, empty/loading/error states; tests in domain and UI modules.
2. Chapter import and editing — TXT/EPUB fixtures, quality fallback, canonical source tests; `import/`, chapter routes.
3. Extraction contract and Gemini 2.5 Flash integration — run persistence, schema validation, uncertainty, retry, server-side key handling; `extraction/`.
4. Suggested vocabulary review — accept/reject/edit/manual add; candidate integration tests.
5. Preparation mode — focused review and progress; preparation UI/tests.
6. Annotated reader — selected highlights, contextual panel, position preservation; reader tests.
7. Personal vocabulary list — filters, edit/remove/context; vocabulary modules.
8. Export — documented CSV contract and escaping tests; export adapter.
9. Import quality and formats — representative EPUB/text PDF validation; parser fixtures.
10. Reading progress and later synchronization — progress model, cloud repository, migrations and conflict policy.
