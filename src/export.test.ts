import { describe, expect, it } from 'vitest';
import {
  filterVocabularyForExport,
  formatVocabularyExport,
  type VocabularyExportEntry,
} from './export';

const entries: VocabularyExportEntry[] = [
  {
    word: 'bright',
    translation: 'lumineux',
    context: 'A bright room',
    bookId: 'book-one',
    bookIds: ['book-one'],
    chapterIds: ['chapter-one'],
  },
  {
    word: 'quiet',
    translation: 'calme',
    context: 'A "quiet" street',
    bookId: 'book-two',
    bookIds: ['book-two'],
    chapterIds: ['chapter-two'],
  },
];

describe('vocabulary export', () => {
  it('exports only the selected book when a book filter is active', () => {
    expect(filterVocabularyForExport(entries, 'book-two')).toEqual([
      entries[1],
    ]);
    expect(filterVocabularyForExport(entries)).toEqual(entries);
  });

  it('exports only entries linked to the selected chapter', () => {
    expect(
      filterVocabularyForExport(entries, undefined, 'chapter-two'),
    ).toEqual([entries[1]]);
  });

  it('formats CSV with examples and escaped quotes', () => {
    expect(
      formatVocabularyExport(entries, {
        separator: ',',
        includeContext: true,
        format: 'csv',
      }),
    ).toBe(
      '"Word","Translation","Example"\n' +
        '"bright","lumineux","A bright room"\n' +
        '"quiet","calme","A ""quiet"" street"',
    );
  });

  it('omits examples and supports custom text separators', () => {
    expect(
      formatVocabularyExport([entries[0]], {
        separator: ' | ',
        includeContext: false,
        format: 'txt',
      }),
    ).toBe('Word | Translation\nbright | lumineux');
  });
});
