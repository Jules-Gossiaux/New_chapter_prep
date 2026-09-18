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
  | 'AI_NOT_CONFIGURED'
  | 'AI_PROVIDER_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'INTERNAL_ERROR';

export async function extractVocabulary(input: ExtractionRequest) {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await supabase.functions.invoke(
    'extract-vocabulary',
    { body: input },
  );
  if (error) {
    let payload: { code?: ExtractionErrorCode; message?: string } = {};
    try {
      payload = JSON.parse(error.message);
    } catch {
      /* SDK may return a plain message. */
    }
    const extracted = new Error(payload.message ?? error.message);
    extracted.name = payload.code ?? 'EXTRACTION_ERROR';
    throw extracted;
  }
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
