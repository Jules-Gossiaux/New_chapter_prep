# Testing

`npm test` runs Vitest in jsdom. Domain tests cover validation and source preservation; persistence tests cover reload and corrupt-storage recovery. Future integration/UI tests must cover book/chapter creation, extraction failure recovery, keyboard access, mobile layout, reader position, candidate confirmation, and deterministic export.
