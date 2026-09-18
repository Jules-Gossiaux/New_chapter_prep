# Roadmap

0. Frontend product prototype — navigable landing/auth/library/book/chapter/extraction/preparation/reader/vocabulary surfaces with mock states and responsive design.
1. Connect Supabase Auth and repositories — complete for email/password Auth, user-owned book/chapter persistence, and server-side extraction-run/candidate persistence. The remaining work is integration coverage and reviewed-vocabulary persistence.
2. Chapter import and editing — TXT/EPUB fixtures, quality fallback, canonical source tests; `import/`, chapter routes.
3. Frequency-guided extraction and Gemini 2.5 Flash integration — implemented for English/French: server-side reference ranks, fixed level thresholds, long-chapter-safe context prompts, run persistence, and stable errors. Remaining: configure the live secret, verify an authenticated call, and add retry/caching policy.
4. Suggested vocabulary review — accept/reject/edit/manual add; candidate integration tests.
5. Preparation mode — focused review and progress; preparation UI/tests.
6. Annotated reader — selected highlights, contextual panel, position preservation; reader tests.
7. Personal vocabulary list — filters, edit/remove/context; vocabulary modules.
8. Export — documented CSV contract and escaping tests; export adapter.
9. Import quality and formats — representative EPUB/text PDF validation; parser fixtures.
10. Reading progress and later synchronization — progress model, cloud repository, migrations and conflict policy.
