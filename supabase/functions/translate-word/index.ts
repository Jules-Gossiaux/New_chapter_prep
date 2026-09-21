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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function sentenceForWord(text: string, word: string) {
  const matcher = new RegExp(
    `(^|[^\\p{L}])${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`,
    'iu',
  );
  const match = matcher.exec(text);
  const position = match?.index ?? 0;
  const start = Math.max(
    0,
    text.lastIndexOf('.', position - 1),
    text.lastIndexOf('!', position - 1),
    text.lastIndexOf('?', position - 1),
    text.lastIndexOf('\n', position - 1),
  );
  const endCandidates = [
    text.indexOf('.', position),
    text.indexOf('!', position),
    text.indexOf('?', position),
    text.indexOf('\n', position),
  ].filter((index) => index >= 0);
  const end = endCandidates.length
    ? Math.min(...endCandidates) + 1
    : text.length;
  return text
    .slice(start === 0 ? 0 : start + 1, end)
    .trim()
    .slice(0, 480);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return json(
        { code: 'AUTH_REQUIRED', message: 'Please sign in first.' },
        401,
      );
    }

    const url = Deno.env.get('SUPABASE_URL');
    const publishableKey =
      Deno.env.get('SUPABASE_ANON_KEY') ??
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!url || !publishableKey || !serviceRoleKey || !apiKey) {
      return json(
        {
          code: 'SERVICE_NOT_CONFIGURED',
          message: 'Word translation is not configured yet.',
        },
        503,
      );
    }

    const authClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) {
      return json(
        {
          code: 'AUTH_REQUIRED',
          message: 'Your session has expired. Please sign in again.',
        },
        401,
      );
    }

    const body = await request.json();
    const chapterId = typeof body.chapterId === 'string' ? body.chapterId : '';
    const word = typeof body.word === 'string' ? body.word.trim() : '';
    if (!chapterId || !word || word.length > 100) {
      return json(
        {
          code: 'INVALID_INPUT',
          message: 'Choose one valid word from this chapter.',
        },
        400,
      );
    }

    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: chapter, error: chapterError } = await admin
      .from('chapters')
      .select('source_text, books!inner(user_id, target_language)')
      .eq('id', chapterId)
      .single();
    const book = chapter ? asRecord(chapter.books) : null;
    if (chapterError || !chapter) {
      return json(
        { code: 'CHAPTER_NOT_FOUND', message: 'This chapter was not found.' },
        404,
      );
    }
    if (!book || String(book.user_id) !== user.id) {
      return json(
        { code: 'FORBIDDEN', message: 'You do not own this chapter.' },
        403,
      );
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('native_language')
      .eq('id', user.id)
      .maybeSingle();
    const nativeLanguage = String(profile?.native_language ?? 'French');
    const context = sentenceForWord(String(chapter.source_text ?? ''), word);
    const prompt = `Translate exactly one word from a reading chapter. Return JSON only: {"translation":"translation in ${nativeLanguage}","partOfSpeech":"part of speech","lemma":"dictionary lemma or null","confidence":"High or Medium"}. Do not add commentary.\n\nChapter language: ${String(book.target_language)}\nWord: ${word}\nContext: ${context}`;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' +
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
    if (response.status === 429 || response.status === 503) {
      return json(
        {
          code: 'AI_TEMPORARILY_UNAVAILABLE',
          message:
            'The translation service is temporarily busy. Please retry in a moment.',
        },
        response.status,
      );
    }
    if (!response.ok) {
      return json(
        {
          code: 'AI_PROVIDER_ERROR',
          message: 'The translation service returned an error.',
        },
        502,
      );
    }
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI_EMPTY_RESPONSE');
    const value = asRecord(JSON.parse(text));
    const translation =
      typeof value?.translation === 'string' ? value.translation.trim() : '';
    if (!translation) throw new Error('AI_INVALID_RESPONSE');
    return json({
      word,
      translation,
      partOfSpeech:
        typeof value?.partOfSpeech === 'string' && value.partOfSpeech.trim()
          ? value.partOfSpeech.trim()
          : 'word',
      lemma:
        typeof value?.lemma === 'string' ? value.lemma.trim() || null : null,
      context,
      confidence: value?.confidence === 'High' ? 'High' : 'Medium',
    });
  } catch (error) {
    console.error(
      'translate-word failed',
      error instanceof Error ? error.name : 'unknown',
    );
    return json(
      {
        code: 'INTERNAL_ERROR',
        message: 'The word could not be translated. Please retry.',
      },
      500,
    );
  }
});
