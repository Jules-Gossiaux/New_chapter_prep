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
export function createId() {
  return crypto.randomUUID();
}
export function createBook(input: unknown): Book {
  const value = bookSchema.parse(input);
  return { ...value, id: createId(), createdAt: new Date().toISOString() };
}
export function createChapter(input: unknown): Chapter {
  const value = chapterSchema.parse(input);
  return {
    ...value,
    id: createId(),
    createdAt: new Date().toISOString(),
    extractionStatus: 'not_started',
  };
}
