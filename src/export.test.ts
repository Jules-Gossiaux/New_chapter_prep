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
  },
  {
    word: 'quiet',
    translation: 'calme',
    context: 'A "quiet" street',
    bookId: 'book-two',
  },
];

describe('vocabulary export', () => {
  it('exports only the selected book when a book filter is active', () => {
    expect(filterVocabularyForExport(entries, 'book-two')).toEqual([
      entries[1],
    ]);
    expect(filterVocabularyForExport(entries)).toEqual(entries);
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
