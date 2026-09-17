import { describe, expect, it } from 'vitest';
import { createBook, createChapter, MAX_CHAPTER_WORDS } from './domain';
describe('domain validation', () => {
  it('creates a valid book', () =>
    expect(
      createBook({ title: 'The Waves', author: '', targetLanguage: 'English' }),
    ).toMatchObject({ title: 'The Waves' }));
  it('rejects invalid input', () => {
    expect(() => createBook({ title: '', targetLanguage: 'French' })).toThrow();
    expect(() =>
      createChapter({ bookId: 'b', number: 1, title: 'One', sourceText: ' ' }),
    ).toThrow();
  });
  it('preserves canonical source text', () =>
    expect(
      createChapter({
        bookId: 'b',
        number: 1,
        title: 'One',
        sourceText: 'Exact  source\ntext.',
      }).sourceText,
    ).toBe('Exact  source\ntext.'));
  it('rejects chapters over the temporary 500 word limit', () =>
    expect(() =>
      createChapter({
        bookId: 'b',
        number: 1,
        title: 'Long',
        sourceText: Array(MAX_CHAPTER_WORDS + 1)
          .fill('word')
          .join(' '),
      }),
    ).toThrow('500 words'));
});
