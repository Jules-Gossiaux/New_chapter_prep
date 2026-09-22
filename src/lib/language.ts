import { franc } from 'franc-min';

export const supportedBookLanguages = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
] as const;

export type SupportedBookLanguage = (typeof supportedBookLanguages)[number];

const languageByIso6393: Record<string, SupportedBookLanguage> = {
  eng: 'English',
  fra: 'French',
  fre: 'French',
  spa: 'Spanish',
  deu: 'German',
  ger: 'German',
  ita: 'Italian',
};

export function detectBookLanguage(text: string): SupportedBookLanguage | null {
  const normalized = text.trim();
  if (normalized.split(/\s+/u).length < 8) return null;
  const detected = languageByIso6393[franc(normalized)];
  return detected ?? null;
}
