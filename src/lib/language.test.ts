import { describe, expect, it } from 'vitest';
import { detectBookLanguage } from './language';

describe('book language detection', () => {
  it('detects supported languages from substantial text', () => {
    expect(
      detectBookLanguage(
        'The little chapter follows a reader through a quiet morning. The words remain clear and the story continues with careful details.',
      ),
    ).toBe('English');
    expect(
      detectBookLanguage(
        'Le petit chapitre accompagne le lecteur pendant une matinée calme. Les mots restent simples et l’histoire continue avec précision.',
      ),
    ).toBe('French');
  });

  it('returns null when the text is too short or unsupported', () => {
    expect(detectBookLanguage('short text')).toBeNull();
  });
});
