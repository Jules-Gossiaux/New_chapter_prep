import { z } from 'zod';
export const bookSchema = z.object({
  title: z.string().trim().min(1, 'Enter a book title.').max(200),
  author: z.string().trim().max(200),
  targetLanguage: z.string().trim().min(2).max(80),
});
export const chapterSchema = z.object({
  bookId: z.string().min(1),
  number: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, 'Enter a chapter title.'),
  sourceText: z.string().trim().min(1, 'Paste some chapter text.'),
});
export type Book = z.infer<typeof bookSchema> & {
  id: string;
  createdAt: string;
};
export type Chapter = z.infer<typeof chapterSchema> & {
  id: string;
  createdAt: string;
  extractionStatus: 'not_started' | 'pending' | 'complete' | 'failed';
};
export type Store = { books: Book[]; chapters: Chapter[] };
export const emptyStore: Store = { books: [], chapters: [] };
/**
 * The chapter is analysed deterministically before Gemini sees only selected
 * word contexts. This generous guard prevents accidental oversized imports
 * without imposing the former AI-context limit on readers.
 */
export const MAX_CHAPTER_WORDS = 50_000;
export const MAX_PREPARED_WORDS = 100;
export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
export function validateChapterWordLimit(text: string) {
  if (countWords(text) > MAX_CHAPTER_WORDS) {
    throw new Error(
      `Chapters are limited to ${MAX_CHAPTER_WORDS.toLocaleString()} words.`,
    );
  }
}
export function createId() {
  return crypto.randomUUID();
}
export function createBook(input: unknown): Book {
  const value = bookSchema.parse(input);
  return { ...value, id: createId(), createdAt: new Date().toISOString() };
}
export function createChapter(input: unknown): Chapter {
  const value = chapterSchema.parse(input);
  validateChapterWordLimit(value.sourceText);
  return {
    ...value,
    id: createId(),
    createdAt: new Date().toISOString(),
    extractionStatus: 'not_started',
  };
}
