# Vocabulary extraction

ChapterPrep supports English and French in this phase. The browser never downloads the frequency data and never receives a service-role or Gemini key.

## Selection

The `vocabulary_frequency` table holds the first 10,000 distinct normalized forms for each supported language. It is populated from the word-frequency CSVs in [orgtre/top-open-subtitles-sentences](https://github.com/orgtre/top-open-subtitles-sentences), based on OpenSubtitles2018. The source repository documents its data limitations: subtitles often contain translations and names, so Gemini is allowed to discard malformed tokens and proper names.

The extraction function uses fixed initial frequency cutoffs: A1 800, A2 1,500, B1 3,000, B2 5,000, C1 8,000, and C2 10,000. It keeps only words occurring in the chapter above the learner's cutoff, ranks the closest words first, and applies the 1–50 maximum selected in the UI. This is a starting estimate, not a claim that CEFR defines exact vocabulary totals.

## Long chapters

Canonical chapter text can contain up to 50,000 words. Token matching is performed in database batches. Gemini receives only the selected candidates and a sentence context capped at 480 characters for each candidate, never the full chapter. If more than 50 words are eligible, the review screen explains that the most frequent eligible words were prioritised.

## Operations and licensing

`vocabulary_frequency` has RLS enabled with an explicit deny-all browser policy. The authenticated Edge Function verifies chapter ownership with the caller token, then uses its server-only service-role client to read the reference table and persist the extraction run.

Keep the OpenSubtitles attribution and its CC BY 3.0 licensing requirements when distributing or replacing the data. Record the source/version in the table if the list is refreshed. Set `GEMINI_API_KEY` in the Supabase Edge Function secrets dashboard before live calls; never place it in Vite variables or commit it.
