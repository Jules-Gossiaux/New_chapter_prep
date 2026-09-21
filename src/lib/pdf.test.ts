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
});
