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

export async function listBooks() {
  const client = requireClient();
  const { data, error } = await client
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    targetLanguage: book.target_language,
    learnerLevel: book.learner_level,
    createdAt: book.created_at,
  })) as BackendBook[];
}

export async function createBackendBook(input: {
  title: string;
  author?: string;
  targetLanguage: string;
  learnerLevel?: string;
}) {
  const client = requireClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');
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
  return data as BackendBook;
}

export async function createBackendChapter(input: {
  bookId: string;
  number: number;
  title: string;
  sourceText: string;
}) {
  const client = requireClient();
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
  return data as BackendChapter;
}
