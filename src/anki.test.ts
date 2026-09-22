import { describe, expect, it } from 'vitest';
import { ankiFields } from './anki';

describe('Anki export fields', () => {
  it('keeps the word, translation and optional context as card fields', () => {
    const fields = ankiFields(
      {
        word: '<word>',
        translation: 'meaning',
        context: 'An example',
        bookId: 'book-1',
      },
      true,
    );

    expect(fields).toEqual(['&lt;word&gt;', 'meaning', 'An example']);
    expect(
      ankiFields(
        {
          ...{
            word: 'word',
            translation: 'meaning',
            context: 'example',
            bookId: 'book-1',
          },
        },
        false,
      )[2],
    ).toBe('');
  });
});
