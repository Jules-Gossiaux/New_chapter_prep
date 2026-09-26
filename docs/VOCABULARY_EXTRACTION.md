# Vocabulary extraction

ChapterPrep supports English and French in this phase. The browser never downloads the frequency data and never receives a service-role or Gemini key.

## Selection

The `vocabulary_frequency` table holds the first 10,000 distinct normalized forms for each supported language. It is populated from the word-frequency CSVs in [orgtre/top-open-subtitles-sentences](https://github.com/orgtre/top-open-subtitles-sentences), based on OpenSubtitles2018. The source repository documents its data limitations: subtitles often contain translations and names, so Gemini is allowed to discard malformed tokens and proper names.

The extraction function uses frequency cutoffs of A1 500, A2 1,500, B1 3,000, B2 6,000, C1 10,000, and C2 15,000. It keeps only words occurring in the chapter strictly above the learner's cutoff and ranks the closest words first. The indicative label saved for each word is assigned from its frequency rank, not estimated by Gemini: ranks 1–500 A1, 501–1,500 A2, 1,501–3,000 B1, 3,001–6,000 B2, 6,001–10,000 B2–C1, and 10,001–15,000 C1 (uncertain). No C2 band is defined yet, so words above 15,000 remain unclassified rather than being mixed into C1. These rank bands are working estimates, not official CEFR vocabulary boundaries.

The current reference table only contains ranks 1–10,000 for each supported language. Therefore, the 10,001–15,000 C1 (uncertain) band and C2 learner cutoff cannot produce words until a larger, quality-reviewed frequency list is loaded. The migration expands the table's allowed rank range to 15,000 but does not add or download frequency data.

## Long chapters

Canonical chapter text can contain up to 50,000 words. Token matching is performed in database batches. Gemini receives only the selected candidates and a sentence context capped at 480 characters for each candidate, never the full chapter. When the eligible pool is larger than the returned selection, the review screen shows the pool size and how many words were selected, ordered by frequency.

## Operations and licensing

`vocabulary_frequency` has RLS enabled with an explicit deny-all browser policy. The authenticated Edge Function verifies chapter ownership with the caller token, then uses its server-only service-role client to read the reference table and persist the extraction run.

Keep the OpenSubtitles attribution and its CC BY 3.0 licensing requirements when distributing or replacing the data. Record the source/version in the table if the list is refreshed. Set `GEMINI_API_KEY` in the Supabase Edge Function secrets dashboard before live calls; never place it in Vite variables or commit it.

## Reader translation

Prepared words are loaded from the selected chapter’s newest complete extraction, so a reader never displays candidates from another chapter. For another clicked word, `translate-word` authenticates the caller, checks chapter ownership, finds a short source sentence server-side, and asks Gemini to translate only that word in context. The browser never receives the Gemini key or sends the full chapter to this lookup endpoint.

## Saved vocabulary

Saving words from the review or reader writes user-owned `vocabulary_entries` and their `chapter_vocabulary` links. The Vocabulary page and its sidebar count load those persisted records across every book and chapter; they never depend on the currently open chapter. Removing a word deletes the user’s vocabulary entry and its links through the existing foreign-key cascade.
