import { describe, expect, it } from 'vitest';
import { uniqueVocabularyEntries } from './books';

describe('uniqueVocabularyEntries', () => {
  it('keeps one non-empty entry per case-insensitive word', () => {
    const entries = uniqueVocabularyEntries([
      { word: 'Little', translation: 'petit' },
      { word: ' little ', translation: 'minuscule' },
      { word: '  ', translation: 'ignored' },
      { word: 'ballet', translation: 'ballet' },
    ]);

    expect(entries).toEqual([
      { word: ' little ', translation: 'minuscule' },
      { word: 'ballet', translation: 'ballet' },
    ]);
  });
});
