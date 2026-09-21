import { countWords, validateChapterWordLimit } from '../domain';
import { supabase } from './supabase';

export type BackendBook = {
  id: string;
  title: string;
  author: string;
  targetLanguage: string;
  learnerLevel: string;
  createdAt: string;
  lastOpenedAt: string;
};

export type BackendChapter = {
  id: string;
  bookId: string;
  number: number;
  title: string;
  sourceText: string;
  wordCount: number;
  extractionStatus: string;
  targetLanguage: string;
  learnerLevel: string;
};

export type BackendVocabularyCandidate = {
  id: string;
  chapterId: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  level: string;
  context: string;
  confidence: 'High' | 'Medium';
  frequencyRank: number;
};

export type BackendVocabularyEntry = {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  context: string;
  bookId: string;
  bookTitle: string;
  createdAt: string;
};

function requireClient() {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  return supabase;
}

export function uniqueVocabularyEntries<T extends { word: string }>(
  entries: T[],
) {
  return Array.from(
    new Map(
      entries
        .filter((entry) => entry.word.trim())
        .map((entry) => [entry.word.trim().toLocaleLowerCase(), entry]),
    ).values(),
  );
}

function mapBook(book: Record<string, unknown>): BackendBook {
  return {
    id: String(book.id),
    title: String(book.title),
    author: String(book.author ?? ''),
    targetLanguage: String(book.target_language),
    learnerLevel: String(book.learner_level),
    createdAt: String(book.created_at),
    lastOpenedAt: String(book.last_opened_at),
  };
}

function mapChapter(chapter: Record<string, unknown>): BackendChapter {
  return {
    id: String(chapter.id),
    bookId: String(chapter.book_id),
    number: Number(chapter.chapter_number),
    title: String(chapter.title),
    sourceText: String(chapter.source_text),
    wordCount: Number(chapter.word_count),
    extractionStatus: String(chapter.extraction_status),
    targetLanguage: String(chapter.target_language),
    learnerLevel: String(chapter.learner_level),
  };
}

function mapVocabularyCandidate(
  candidate: Record<string, unknown>,
  chapterId: string,
): BackendVocabularyCandidate {
  return {
    id: String(candidate.id),
    chapterId,
    word: String(candidate.word),
    translation: String(candidate.translation),
    partOfSpeech: String(candidate.part_of_speech ?? 'word'),
    level: String(candidate.cefr_level ?? '—'),
    context: String(candidate.context ?? ''),
    confidence: candidate.confidence === 'High' ? 'High' : 'Medium',
    frequencyRank: Number(candidate.frequency_rank ?? 0),
  };
}

async function requireUser() {
  const client = requireClient();
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error('AUTH_REQUIRED');
  return { client, user: userData.user };
}

export async function listBooks() {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('books')
    .select('*')
    .order('last_opened_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((book) => mapBook(book));
}

export async function markBackendBookOpened(bookId: string) {
  const { client } = await requireUser();
  const { error } = await client
    .from('books')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', bookId);
  if (error) throw error;
}

export async function createBackendBook(input: {
  title: string;
  author?: string;
  targetLanguage: string;
  learnerLevel?: string;
}) {
  const { client, user } = await requireUser();
  const { data, error } = await client
    .from('books')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      author: input.author?.trim() ?? '',
      target_language: input.targetLanguage,
      learner_level: input.learnerLevel ?? 'B1',
    })
    .select()
    .single();
  if (error) throw error;
  return mapBook(data);
}

export async function updateBackendBookLevel(
  bookId: string,
  learnerLevel: string,
) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('books')
    .update({ learner_level: learnerLevel })
    .eq('id', bookId)
    .select()
    .single();
  if (error) throw error;
  return mapBook(data);
}

export async function updateBackendBook(
  bookId: string,
  input: { title: string; author: string; targetLanguage: string },
) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('books')
    .update({
      title: input.title.trim(),
      author: input.author.trim(),
      target_language: input.targetLanguage,
    })
    .eq('id', bookId)
    .select()
    .single();
  if (error) throw error;
  return mapBook(data);
}

export async function deleteBackendBook(bookId: string) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('books')
    .delete()
    .eq('id', bookId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('BOOK_NOT_FOUND_OR_FORBIDDEN');
}

export async function listBackendChapters(bookId: string) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((chapter) => mapChapter(chapter));
}

export async function createBackendChapter(input: {
  bookId: string;
  number: number;
  title: string;
  sourceText: string;
  targetLanguage: string;
  learnerLevel: string;
}) {
  const { client } = await requireUser();
  validateChapterWordLimit(input.sourceText);
  const { data, error } = await client
    .from('chapters')
    .insert({
      book_id: input.bookId,
      chapter_number: input.number,
      title: input.title.trim(),
      source_text: input.sourceText,
      word_count: countWords(input.sourceText),
      target_language: input.targetLanguage,
      learner_level: input.learnerLevel,
    })
    .select()
    .single();
  if (error) throw error;
  return mapChapter(data);
}

export async function updateBackendChapter(
  chapterId: string,
  input: {
    number: number;
    title: string;
    sourceText: string;
    targetLanguage: string;
    learnerLevel: string;
  },
) {
  const { client } = await requireUser();
  validateChapterWordLimit(input.sourceText);
  const { data, error } = await client
    .from('chapters')
    .update({
      chapter_number: input.number,
      title: input.title.trim(),
      source_text: input.sourceText,
      word_count: countWords(input.sourceText),
      target_language: input.targetLanguage,
      learner_level: input.learnerLevel,
      extraction_status: 'not_started',
    })
    .eq('id', chapterId)
    .select()
    .single();
  if (error) throw error;
  return mapChapter(data);
}

export async function deleteBackendChapter(chapterId: string) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('chapters')
    .delete()
    .eq('id', chapterId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('CHAPTER_NOT_FOUND_OR_FORBIDDEN');
}

export async function listBackendChapterCandidates(chapterId: string) {
  const { client } = await requireUser();
  const { data: run, error: runError } = await client
    .from('extraction_runs')
    .select('id')
    .eq('chapter_id', chapterId)
    .eq('status', 'complete')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) return [];

  const { data, error } = await client
    .from('vocabulary_candidates')
    .select('*')
    .eq('extraction_run_id', run.id)
    .order('frequency_rank', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((candidate) =>
    mapVocabularyCandidate(candidate, chapterId),
  );
}

export async function listBackendVocabularyEntries() {
  const { client } = await requireUser();
  const { data: entries, error: entriesError } = await client
    .from('vocabulary_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (entriesError) throw entriesError;
  if (!entries?.length) return [] as BackendVocabularyEntry[];

  const entryIds = entries.map((entry) => String(entry.id));
  const { data: links, error: linksError } = await client
    .from('chapter_vocabulary')
    .select(
      'vocabulary_entry_id, source_context, chapters!inner(book_id, title, books!inner(id, title))',
    )
    .in('vocabulary_entry_id', entryIds);
  if (linksError) throw linksError;

  const linkByEntryId = new Map(
    (links ?? []).map((link) => [String(link.vocabulary_entry_id), link]),
  );
  return entries.map((entry) => {
    const link = linkByEntryId.get(String(entry.id));
    const chapter = (link?.chapters ?? {}) as Record<string, unknown>;
    const book = (chapter.books ?? {}) as Record<string, unknown>;
    return {
      id: String(entry.id),
      word: String(entry.word),
      translation: String(entry.translation ?? 'Translation unavailable'),
      partOfSpeech: String(entry.notes ?? 'word'),
      context: String(link?.source_context ?? ''),
      bookId: String(book.id ?? chapter.book_id ?? ''),
      bookTitle: String(book.title ?? 'Unknown book'),
      createdAt: String(entry.created_at),
    };
  });
}

export async function saveBackendVocabularyEntries(input: {
  chapterId: string;
  entries: Array<
    Pick<
      BackendVocabularyEntry,
      'word' | 'translation' | 'partOfSpeech' | 'context'
    >
  >;
  candidateIds?: string[];
}) {
  if (!input.entries.length) return;
  const { client, user } = await requireUser();
  const entriesToSave = uniqueVocabularyEntries(input.entries);
  if (!entriesToSave.length) return;
  const { data: entries, error: entriesError } = await client
    .from('vocabulary_entries')
    .upsert(
      entriesToSave.map((entry) => ({
        user_id: user.id,
        word: entry.word.trim(),
        translation: entry.translation,
        notes: entry.partOfSpeech,
      })),
      { onConflict: 'user_id,word' },
    )
    .select('id, word');
  if (entriesError) throw entriesError;

  const entryByWord = new Map(
    (entries ?? []).map((entry) => [String(entry.word), String(entry.id)]),
  );
  const { error: linksError } = await client.from('chapter_vocabulary').upsert(
    entriesToSave.flatMap((entry) => {
      const vocabularyEntryId = entryByWord.get(entry.word.trim());
      return vocabularyEntryId
        ? [
            {
              chapter_id: input.chapterId,
              vocabulary_entry_id: vocabularyEntryId,
              source_context: entry.context,
            },
          ]
        : [];
    }),
    { onConflict: 'chapter_id,vocabulary_entry_id' },
  );
  if (linksError) throw linksError;

  if (input.candidateIds?.length) {
    const { error: candidatesError } = await client
      .from('vocabulary_candidates')
      .update({ is_accepted: true })
      .in('id', input.candidateIds);
    if (candidatesError) throw candidatesError;
  }
}

export async function deleteBackendVocabularyEntry(entryId: string) {
  const { client } = await requireUser();
  const { data, error } = await client
    .from('vocabulary_entries')
    .delete()
    .eq('id', entryId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('VOCABULARY_ENTRY_NOT_FOUND_OR_FORBIDDEN');
}
