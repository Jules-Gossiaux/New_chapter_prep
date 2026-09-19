# ChapterPrep design system

## Direction

The frontend uses a calm editorial interface: warm paper neutrals, deep forest ink, a restrained coral accent, generous whitespace, and serif typography for reading moments. The design is intentionally quiet so vocabulary support does not compete with the chapter.

## Tokens

- Ink: `#182A29`; deep green: `#153E35`; action green: `#285D4D`.
- Paper: `#F7F6F1`; white surface: `#FFFFFF`; line: `#E1E2DA`.
- Coral accent: `#DD8765`; pale sage: `#DFE9E1`.
- UI type: DM Sans. Editorial type: Playfair Display.
- Radius: 8px for controls, 12–16px for cards, circular status/avatar elements.

## Interaction rules

- Primary actions use green with a clear text label; important actions never rely on color alone.
- Coral is reserved for emphasis, editorial highlights, and progress accents.
- Loading, empty, success, and unavailable AI states use plain-language messages.
- The reader keeps the original text dominant. Only selected vocabulary is highlighted.
- Desktop uses a persistent sidebar; mobile collapses it into a drawer with touch-sized controls.
- Keyboard focus is visible with a coral outline.
- Dark mode is a distinct charcoal-and-forest palette, not an inverted paper theme: page, sidebar, elevated cards, controls, muted copy, borders, and selected states each receive dedicated dark tokens. Body copy and headings must retain high contrast against every dark surface.

## Frontend prototype scope

All product surfaces are navigable in the current frontend using coherent mock data. Auth, extraction, persistence, and server-side export behavior remain explicit frontend previews until backend work begins.
