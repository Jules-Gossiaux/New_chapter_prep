import { describe, expect, it } from 'vitest';
import { splitTextIntoPdfChapters } from './pdf';

describe('PDF chapter splitting', () => {
  it('keeps paragraph boundaries before the target size', () => {
    const chapters = splitTextIntoPdfChapters(
      'One two three.\n\nFour five six.\n\nSeven eight nine.',
      6,
    );

    expect(chapters.map((chapter) => chapter.words)).toEqual([6, 3]);
    expect(chapters[0].sourceText).toContain('Four five six.');
  });

  it('uses sentence boundaries inside a paragraph longer than 200 words', () => {
    const paragraph = Array.from(
      { length: 30 },
      (_, index) => `Sentence ${index + 1} has enough words to count clearly.`,
    ).join(' ');
    const chapters = splitTextIntoPdfChapters(paragraph, 60);

    expect(chapters.length).toBeGreaterThan(1);
    expect(chapters[0].sourceText).toMatch(/\.$/);
    expect(chapters.every((chapter) => chapter.words > 0)).toBe(true);
  });

  it('uses the target size to group page-sized paragraphs', () => {
    const page = Array.from(
      { length: 400 },
      (_, index) => `Page sentence ${index + 1}.`,
    ).join(' ');
    const text = [page, page, page, page].join('\n\n');

    const smaller = splitTextIntoPdfChapters(text, 1000);
    const larger = splitTextIntoPdfChapters(text, 2300);

    expect(smaller.length).toBeGreaterThan(larger.length);
    expect(smaller.reduce((total, chapter) => total + chapter.words, 0)).toBe(
      larger.reduce((total, chapter) => total + chapter.words, 0),
    );
  });
});
