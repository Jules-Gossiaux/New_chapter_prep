import { supabase } from './supabase';

export type ExtractionRequest = {
  chapterId: string;
  requestedCount: number;
};
export type ExtractionErrorCode =
  | 'AUTH_REQUIRED'
  | 'CHAPTER_TOO_LONG'
  | 'INVALID_COUNT'
  | 'UNSUPPORTED_LANGUAGE'
  | 'NO_ELIGIBLE_VOCABULARY'
  | 'AI_QUOTA_EXCEEDED'
  | 'AI_TEMPORARILY_UNAVAILABLE'
  | 'AI_NOT_CONFIGURED'
  | 'AI_PROVIDER_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'INTERNAL_ERROR';

export type TranslationRequest = {
  chapterId: string;
  word: string;
};

async function responseError(error: { message: string; context?: unknown }) {
  let payload: { code?: string; message?: string } = {};
  try {
    const response = error.context;
    payload =
      response instanceof Response
        ? ((await response.json()) as typeof payload)
        : JSON.parse(error.message);
  } catch {
    /* SDK may return a plain message. */
  }
  const extracted = new Error(payload.message ?? error.message);
  extracted.name = payload.code ?? 'EDGE_FUNCTION_ERROR';
  throw extracted;
}

export async function extractVocabulary(input: ExtractionRequest) {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await supabase.functions.invoke(
    'extract-vocabulary',
    { body: input },
  );
  if (error) await responseError(error);
  return data as {
    provider: string;
    model: string;
    inputWordCount: number;
    eligibleCount: number;
    items: Array<{
      id: string;
      word: string;
      lemma: string | null;
      translation: string;
      partOfSpeech: string;
      level: string;
      context: string;
      confidence: 'High' | 'Medium';
      frequencyRank: number;
    }>;
  };
}

export async function translateVocabularyWord(input: TranslationRequest) {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await supabase.functions.invoke('translate-word', {
    body: input,
  });
  if (error) await responseError(error);
  return data as {
    word: string;
    translation: string;
    partOfSpeech: string;
    lemma: string | null;
    context: string;
    confidence: 'High' | 'Medium';
  };
}
