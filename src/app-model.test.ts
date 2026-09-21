import { describe, expect, it } from 'vitest';
import { displayNameFromEmail, sortChapterPreviews } from './app-model';

describe('sortChapterPreviews', () => {
  it('orders chapters by their numeric chapter number without mutating input', () => {
    const chapters = [
      {
        id: '3',
        number: 10,
        title: 'Ten',
        words: 0,
        status: 'Not started' as const,
      },
      {
        id: '1',
        number: 2,
        title: 'Two',
        words: 0,
        status: 'Not started' as const,
      },
      {
        id: '2',
        number: 1,
        title: 'One',
        words: 0,
        status: 'Not started' as const,
      },
    ];

    expect(
      sortChapterPreviews(chapters).map((chapter) => chapter.number),
    ).toEqual([1, 2, 10]);
    expect(chapters.map((chapter) => chapter.number)).toEqual([10, 2, 1]);
  });
});

describe('displayNameFromEmail', () => {
  it('uses and capitalizes the first local-part word', () => {
    expect(displayNameFromEmail('aeroxe.gossiaux@gmail.com')).toBe('Aeroxe');
    expect(displayNameFromEmail('reader@example.com')).toBe('Reader');
    expect(displayNameFromEmail(null)).toBeNull();
  });
});
