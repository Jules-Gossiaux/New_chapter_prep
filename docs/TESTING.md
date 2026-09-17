# Testing

`npm test` runs Vitest in jsdom. Domain tests cover validation and source preservation; persistence tests cover reload and corrupt-storage recovery. The current frontend is also manually smoke-tested through the full mock journey: landing → auth → library → book → chapter → review → preparation → reader → vocabulary/export.

Future integration/UI tests must cover book/chapter creation, extraction failure recovery, keyboard access, mobile layout, reader position, arbitrary-word lookup, candidate confirmation, book-scoped export, and deterministic CSV escaping. The current automated suite does not claim browser-level E2E coverage.
