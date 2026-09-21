export type View =
  | 'landing'
  | 'auth'
  | 'library'
  | 'newBook'
  | 'book'
  | 'chapter'
  | 'review'
  | 'prepare'
  | 'reader'
  | 'vocabulary'
  | 'settings';
export type Candidate = {
  id: string;
  bookId: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  level: string;
  context: string;
  confidence: 'High' | 'Medium';
};
export type ChapterPreview = {
  id: string;
  number: number;
  title: string;
  words: number;
  status: 'Ready' | 'Not started' | 'In progress';
  sourceText?: string;
  language?: string;
  learnerLevel?: string;
};
export type DemoBook = {
  id: string;
  title: string;
  author: string;
  language: string;
  level: string;
  progress: number;
  cover: string;
  chapters: ChapterPreview[];
};

export function sortChapterPreviews(chapters: ChapterPreview[]) {
  return [...chapters].sort((a, b) => a.number - b.number);
}

export function displayNameFromEmail(email: string | null | undefined) {
  const firstWord = email
    ?.split('@')[0]
    ?.split(/[._\-\s]+/u)[0]
    ?.trim();
  if (!firstWord) return null;
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

export const candidates: Candidate[] = [
  {
    id: 'c1',
    bookId: 'little-prince',
    word: 'discerning',
    translation: 'perspicace',
    partOfSpeech: 'adjective',
    level: 'C1',
    context:
      'A discerning reader notices the small changes in the narrator’s voice.',
    confidence: 'High',
  },
  {
    id: 'c2',
    bookId: 'little-prince',
    word: 'unsettling',
    translation: 'troublant',
    partOfSpeech: 'adjective',
    level: 'B2',
    context:
      'There was something unsettling about the silence after the storm.',
    confidence: 'High',
  },
  {
    id: 'c3',
    bookId: 'little-prince',
    word: 'to linger',
    translation: 's’attarder',
    partOfSpeech: 'verb',
    level: 'B2',
    context: 'She let her gaze linger on the last line of the letter.',
    confidence: 'Medium',
  },
  {
    id: 'c4',
    bookId: 'little-prince',
    word: 'faintly',
    translation: 'faiblement',
    partOfSpeech: 'adverb',
    level: 'B1',
    context: 'Music could be heard faintly from the room upstairs.',
    confidence: 'High',
  },
  {
    id: 'c5',
    bookId: 'little-prince',
    word: 'the aftermath',
    translation: 'les conséquences',
    partOfSpeech: 'noun',
    level: 'C1',
    context: 'In the aftermath, everyone spoke more quietly than before.',
    confidence: 'Medium',
  },
];

export const demoBooks: DemoBook[] = [
  {
    id: 'little-prince',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    language: 'French',
    level: 'B1',
    progress: 68,
    cover: 'prince',
    chapters: [
      {
        id: 'lp-1',
        number: 1,
        title: 'The Drawing',
        words: 842,
        status: 'Ready',
      },
      {
        id: 'lp-2',
        number: 2,
        title: 'The Asteroid',
        words: 1051,
        status: 'In progress',
      },
      {
        id: 'lp-3',
        number: 3,
        title: 'The Baobabs',
        words: 0,
        status: 'Not started',
      },
    ],
  },
  {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    language: 'English',
    level: 'B2',
    progress: 24,
    cover: 'gatsby',
    chapters: [
      {
        id: 'gg-1',
        number: 1,
        title: 'In My Younger and More Vulnerable Years',
        words: 1203,
        status: 'Ready',
      },
      {
        id: 'gg-2',
        number: 2,
        title: 'The Valley of Ashes',
        words: 0,
        status: 'Not started',
      },
    ],
  },
  {
    id: 'stranger',
    title: 'L’Étranger',
    author: 'Albert Camus',
    language: 'French',
    level: 'B2',
    progress: 0,
    cover: 'stranger',
    chapters: [
      {
        id: 'st-1',
        number: 1,
        title: 'Aujourd’hui, maman est morte',
        words: 0,
        status: 'Not started',
      },
    ],
  },
];

export const readerParagraphs = [
  'The room was quiet when she arrived. Outside, rain traced thin lines down the window, and the city seemed to be holding its breath.',
  'She opened the letter again, though she already knew every word. There was something unsettling in the way the final sentence lingered in her mind.',
  'A discerning reader might have noticed the faintly different tone. It was not quite fear, and not quite hope — only the feeling that something had changed.',
];
