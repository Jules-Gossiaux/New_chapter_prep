import { countWords, validateChapterWordLimit } from '../domain';
import { supabase } from './supabase';

export type BackendBook = {
  id: string;
  title: string;
  author: string;
  targetLanguage: string;
  learnerLevel: string;
  createdAt: string;
};

export type BackendChapter = {
  id: string;
  bookId: string;
  number: number;
  title: string;
  sourceText: string;
  wordCount: number;
  extractionStatus: string;
};

function requireClient() {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  return supabase;
}

function mapBook(book: Record<string, unknown>): BackendBook {
  return {
    id: String(book.id),
    title: String(book.title),
    author: String(book.author ?? ''),
    targetLanguage: String(book.target_language),
    learnerLevel: String(book.learner_level),
    createdAt: String(book.created_at),
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
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((book) => mapBook(book));
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
    })
    .select()
    .single();
  if (error) throw error;
  return mapChapter(data);
}
