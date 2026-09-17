import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response('ok', { headers: cors });
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader)
      return json(
        {
          code: 'AUTH_REQUIRED',
          message: 'Please sign in before extracting vocabulary.',
        },
        401,
      );
    const supabaseKey =
      Deno.env.get('SUPABASE_ANON_KEY') ??
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    if (!supabaseKey)
      return json(
        {
          code: 'SUPABASE_NOT_CONFIGURED',
          message: 'Supabase authentication is not configured.',
        },
        503,
      );
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user)
      return json(
        {
          code: 'AUTH_REQUIRED',
          message: 'Your session has expired. Please sign in again.',
        },
        401,
      );
    const body = await request.json();
    const sourceText =
      typeof body.sourceText === 'string' ? body.sourceText : '';
    const targetLanguage =
      typeof body.targetLanguage === 'string' ? body.targetLanguage : '';
    const learnerLevel =
      typeof body.learnerLevel === 'string' ? body.learnerLevel : 'B1';
    const requestedCount = Number(body.requestedCount || 5);
    const inputWordCount = countWords(sourceText);
    if (!sourceText || !targetLanguage)
      return json(
        {
          code: 'INVALID_INPUT',
          message: 'Chapter text and target language are required.',
        },
        400,
      );
    if (inputWordCount > 500)
      return json(
        {
          code: 'CHAPTER_TOO_LONG',
          message: 'Chapters are limited to 500 words for now.',
        },
        413,
      );
    if (
      !Number.isInteger(requestedCount) ||
      requestedCount < 1 ||
      requestedCount > 50
    )
      return json(
        { code: 'INVALID_COUNT', message: 'Choose between 1 and 50 words.' },
        400,
      );
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey)
      return json(
        {
          code: 'AI_NOT_CONFIGURED',
          message: 'Vocabulary extraction is not configured yet.',
        },
        503,
      );
    const prompt = `Extract up to ${requestedCount} useful vocabulary items from this ${targetLanguage} chapter for a ${learnerLevel} learner. Return only JSON with an "items" array. Each item must contain word, lemma, translation, partOfSpeech, level, context, confidence. Preserve the chapter text and do not translate the whole chapter.\n\nCHAPTER:\n${sourceText}`;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (response.status === 429)
      return json(
        {
          code: 'AI_QUOTA_EXCEEDED',
          message:
            'Vocabulary extraction is temporarily unavailable because the AI usage limit was reached. Please try again later.',
        },
        429,
      );
    if (!response.ok)
      return json(
        {
          code: 'AI_PROVIDER_ERROR',
          message:
            'The vocabulary service returned an error. Your chapter was not changed.',
        },
        502,
      );
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text)
      return json(
        {
          code: 'AI_EMPTY_RESPONSE',
          message:
            'The vocabulary service returned no suggestions. Please retry.',
        },
        502,
      );
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json(
        {
          code: 'AI_INVALID_RESPONSE',
          message:
            'The vocabulary service returned an unreadable result. Please retry.',
        },
        502,
      );
    }
    return json({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      inputWordCount,
      items: (parsed as { items?: unknown[] }).items ?? [],
    });
  } catch (error) {
    console.error(
      'extract-vocabulary failed',
      error instanceof Error ? error.name : 'unknown',
    );
    return json(
      {
        code: 'INTERNAL_ERROR',
        message:
          'Something went wrong while extracting vocabulary. Your chapter was not changed.',
      },
      500,
    );
  }
});
