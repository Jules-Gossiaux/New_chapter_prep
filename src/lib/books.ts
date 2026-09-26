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
  coverPath: string | null;
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
  bookIds: string[];
  chapterIds: string[];
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
    coverPath: book.cover_path ? String(book.cover_path) : null,
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

export async function listBackendChapterReadStatus(chapterIds: string[]) {
  if (!chapterIds.length) return new Set<string>();
  const { client } = await requireUser();
  const { data, error } = await client
    .from('reading_progress')
    .select('chapter_id, completed')
    .in('chapter_id', chapterIds);
  if (error) throw error;
  return new Set(
    (data ?? [])
      .filter((row) => row.completed)
      .map((row) => String(row.chapter_id)),
  );
}

export async function setBackendChapterRead(
  chapterId: string,
  completed: boolean,
) {
  const { client, user } = await requireUser();
  const { data: existing, error: selectError } = await client
    .from('reading_progress')
    .select('chapter_id')
    .eq('chapter_id', chapterId)
    .maybeSingle();
  if (selectError) throw selectError;

  const result = existing
    ? await client
        .from('reading_progress')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('chapter_id', chapterId)
    : await client
        .from('reading_progress')
        .insert({ user_id: user.id, chapter_id: chapterId, completed });
  if (result.error) throw result.error;
}

export async function getBackendBookCoverUrl(coverPath: string | null) {
  if (!coverPath) return null;
  const { client } = await requireUser();
  const { data, error } = await client.storage
    .from('book-covers')
    .createSignedUrl(coverPath, 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadBackendBookCover(
  bookId: string,
  file: File,
  previousPath: string | null,
) {
  const { client, user } = await requireUser();
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type)) throw new Error('COVER_UNSUPPORTED_TYPE');
  if (file.size > 5 * 1024 * 1024) throw new Error('COVER_TOO_LARGE');

  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${user.id}/${bookId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage
    .from('book-covers')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { error: updateError } = await client
    .from('books')
    .update({ cover_path: path })
    .eq('id', bookId);
  if (updateError) {
    await client.storage.from('book-covers').remove([path]);
    throw updateError;
  }

  if (previousPath) {
    const { error: removeError } = await client.storage
      .from('book-covers')
      .remove([previousPath]);
    if (removeError) console.warn('Unable to remove previous book cover');
  }

  const { data: signed, error: signedError } = await client.storage
    .from('book-covers')
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedError) throw signedError;
  return { path, url: signed.signedUrl };
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
  const { data: book, error: bookError } = await client
    .from('books')
    .select('cover_path')
    .eq('id', bookId)
    .maybeSingle();
  if (bookError) throw bookError;
  const { data: chapters, error: chaptersError } = await client
    .from('chapters')
    .select('id')
    .eq('book_id', bookId);
  if (chaptersError) throw chaptersError;
  const chapterIds = (chapters ?? []).map((chapter) => String(chapter.id));
  let vocabularyEntryIds: string[] = [];
  if (chapterIds.length) {
    const { data: links, error: linksError } = await client
      .from('chapter_vocabulary')
      .select('vocabulary_entry_id')
      .in('chapter_id', chapterIds);
    if (linksError) throw linksError;
    vocabularyEntryIds = Array.from(
      new Set((links ?? []).map((link) => String(link.vocabulary_entry_id))),
    );
  }
  const { data, error } = await client
    .from('books')
    .delete()
    .eq('id', bookId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('BOOK_NOT_FOUND_OR_FORBIDDEN');

  if (book?.cover_path) {
    const { error: coverError } = await client.storage
      .from('book-covers')
      .remove([String(book.cover_path)]);
    if (coverError) console.warn('Unable to remove deleted book cover');
  }

  if (vocabularyEntryIds.length) {
    const { data: remainingLinks, error: remainingLinksError } = await client
      .from('chapter_vocabulary')
      .select('vocabulary_entry_id')
      .in('vocabulary_entry_id', vocabularyEntryIds);
    if (remainingLinksError) throw remainingLinksError;
    const linkedIds = new Set(
      (remainingLinks ?? []).map((link) => String(link.vocabulary_entry_id)),
    );
    const orphanedIds = vocabularyEntryIds.filter((id) => !linkedIds.has(id));
    if (orphanedIds.length) {
      const { error: vocabularyError } = await client
        .from('vocabulary_entries')
        .delete()
        .in('id', orphanedIds);
      if (vocabularyError) throw vocabularyError;
    }
  }
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
      'vocabulary_entry_id, source_context, chapters!inner(id, book_id, title, books!inner(id, title))',
    )
    .in('vocabulary_entry_id', entryIds);
  if (linksError) throw linksError;

  const linksByEntryId = new Map<string, Array<Record<string, unknown>>>();
  for (const link of links ?? []) {
    const entryId = String(link.vocabulary_entry_id);
    const existing = linksByEntryId.get(entryId) ?? [];
    existing.push(link as Record<string, unknown>);
    linksByEntryId.set(entryId, existing);
  }
  return entries.map((entry) => {
    const entryLinks = linksByEntryId.get(String(entry.id)) ?? [];
    const firstLink = entryLinks[0];
    const chapter = (firstLink?.chapters ?? {}) as Record<string, unknown>;
    const book = (chapter.books ?? {}) as Record<string, unknown>;
    const bookIds = Array.from(
      new Set(
        entryLinks
          .map((link) => {
            const linkedChapter = (link.chapters ?? {}) as Record<
              string,
              unknown
            >;
            const linkedBook = (linkedChapter.books ?? {}) as Record<
              string,
              unknown
            >;
            return String(linkedBook.id ?? linkedChapter.book_id ?? '');
          })
          .filter(Boolean),
      ),
    );
    const chapterIds = Array.from(
      new Set(
        entryLinks
          .map((link) =>
            String(
              (link.chapters as Record<string, unknown> | undefined)?.id ?? '',
            ),
          )
          .filter(Boolean),
      ),
    );
    return {
      id: String(entry.id),
      word: String(entry.word),
      translation: String(entry.translation ?? 'Translation unavailable'),
      partOfSpeech: String(entry.notes ?? 'word'),
      context: String(firstLink?.source_context ?? ''),
      bookId: String(book.id ?? chapter.book_id ?? ''),
      bookTitle: String(book.title ?? 'Unknown book'),
      bookIds,
      chapterIds,
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
