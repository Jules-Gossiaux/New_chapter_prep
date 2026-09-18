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

const MAX_CHAPTER_WORDS = 50_000;
const MAX_REQUESTED_WORDS = 50;
const levelFrequencyCutoffs: Record<string, number> = {
  A1: 800,
  A2: 1500,
  B1: 3000,
  B2: 5000,
  C1: 8000,
  C2: 10000,
};

type FrequencyRow = {
  normalized_word: string;
  frequency_rank: number;
  source_count: number;
};
type RankedCandidate = FrequencyRow & {
  word: string;
  context: string;
  occurrences: number;
};

const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

function normalizeWord(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^'+|'+$/g, '');
}

function tokenize(value: string) {
  const matches = value.match(/[\p{L}][\p{L}'’-]*/gu) ?? [];
  return matches
    .map((word) => ({ word, normalized: normalizeWord(word) }))
    .filter(({ normalized }) => normalized.length > 1);
}

function sentenceAround(value: string, position: number) {
  const start = Math.max(
    0,
    value.lastIndexOf('.', position - 1),
    value.lastIndexOf('!', position - 1),
    value.lastIndexOf('?', position - 1),
    value.lastIndexOf('\n', position - 1),
  );
  const endCandidates = [
    value.indexOf('.', position),
    value.indexOf('!', position),
    value.indexOf('?', position),
    value.indexOf('\n', position),
  ].filter((index) => index >= 0);
  const end = endCandidates.length
    ? Math.min(...endCandidates) + 1
    : value.length;
  return value
    .slice(start === 0 ? 0 : start + 1, end)
    .trim()
    .slice(0, 480);
}

function languageCode(value: string) {
  const normalized = value.trim().toLocaleLowerCase();
  if (normalized === 'english' || normalized === 'en') return 'en';
  if (
    normalized === 'french' ||
    normalized === 'fr' ||
    normalized === 'français'
  )
    return 'fr';
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response('ok', { headers: cors });

  let runId: string | null = null;
  let chapterId: string | null = null;
  let admin: ReturnType<typeof createClient> | null = null;
  const failRun = async (code: string) => {
    if (!admin || !runId || !chapterId) return;
    await Promise.all([
      admin
        .from('extraction_runs')
        .update({
          status: 'failed',
          error_code: code,
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId),
      admin
        .from('chapters')
        .update({ extraction_status: 'failed' })
        .eq('id', chapterId),
    ]);
  };

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

    const url = Deno.env.get('SUPABASE_URL');
    const publishableKey =
      Deno.env.get('SUPABASE_ANON_KEY') ??
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !publishableKey || !serviceRoleKey)
      return json(
        {
          code: 'SUPABASE_NOT_CONFIGURED',
          message: 'Supabase extraction is not configured.',
        },
        503,
      );

    const authClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user)
      return json(
        {
          code: 'AUTH_REQUIRED',
          message: 'Your session has expired. Please sign in again.',
        },
        401,
      );

    const body = await request.json();
    chapterId = typeof body.chapterId === 'string' ? body.chapterId : null;
    const requestedCount = Number(body.requestedCount);
    if (!chapterId)
      return json(
        { code: 'INVALID_INPUT', message: 'A chapter is required.' },
        400,
      );
    if (
      !Number.isInteger(requestedCount) ||
      requestedCount < 1 ||
      requestedCount > MAX_REQUESTED_WORDS
    )
      return json(
        {
          code: 'INVALID_COUNT',
          message: `Choose between 1 and ${MAX_REQUESTED_WORDS} words.`,
        },
        400,
      );

    admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: chapter, error: chapterError } = await admin
      .from('chapters')
      .select(
        'id, source_text, word_count, books!inner(user_id, target_language, learner_level)',
      )
      .eq('id', chapterId)
      .single();
    if (chapterError || !chapter)
      return json(
        { code: 'CHAPTER_NOT_FOUND', message: 'This chapter was not found.' },
        404,
      );

    const book = asRecord(chapter.books);
    if (!book || String(book.user_id) !== user.id)
      return json(
        { code: 'FORBIDDEN', message: 'You do not own this chapter.' },
        403,
      );

    const sourceText = String(chapter.source_text ?? '');
    const inputWordCount = countWords(sourceText);
    if (!sourceText || inputWordCount < 1)
      return json(
        { code: 'INVALID_INPUT', message: 'Chapter text is required.' },
        400,
      );
    if (inputWordCount > MAX_CHAPTER_WORDS)
      return json(
        {
          code: 'CHAPTER_TOO_LONG',
          message: `Chapters are limited to ${MAX_CHAPTER_WORDS.toLocaleString()} words.`,
        },
        413,
      );

    const code = languageCode(String(book.target_language ?? ''));
    if (!code)
      return json(
        {
          code: 'UNSUPPORTED_LANGUAGE',
          message:
            'Vocabulary extraction currently supports English and French.',
        },
        400,
      );
    const learnerLevel = String(book.learner_level ?? 'B1').toUpperCase();
    const cutoff = levelFrequencyCutoffs[learnerLevel];
    if (!cutoff)
      return json(
        { code: 'INVALID_INPUT', message: 'The learner level is invalid.' },
        400,
      );

    const { data: profile } = await admin
      .from('profiles')
      .select('native_language')
      .eq('id', user.id)
      .maybeSingle();
    const nativeLanguage = String(profile?.native_language ?? 'French');

    const { data: run, error: runError } = await admin
      .from('extraction_runs')
      .insert({
        chapter_id: chapterId,
        requested_count: requestedCount,
        input_word_count: inputWordCount,
        status: 'pending',
      })
      .select('id')
      .single();
    if (runError || !run) throw new Error('EXTRACTION_RUN_CREATE_FAILED');
    runId = String(run.id);
    await admin
      .from('chapters')
      .update({ extraction_status: 'pending' })
      .eq('id', chapterId);

    const sourceTokens = tokenize(sourceText);
    const seen = new Map<
      string,
      { word: string; position: number; occurrences: number }
    >();
    for (const token of sourceTokens) {
      const existing = seen.get(token.normalized);
      if (existing) existing.occurrences += 1;
      else {
        const position = sourceText
          .toLocaleLowerCase()
          .indexOf(token.word.toLocaleLowerCase());
        seen.set(token.normalized, {
          word: token.word,
          position,
          occurrences: 1,
        });
      }
    }

    const frequencyRows: FrequencyRow[] = [];
    const words = [...seen.keys()];
    for (let index = 0; index < words.length; index += 750) {
      const { data, error } = await admin
        .from('vocabulary_frequency')
        .select('normalized_word, frequency_rank, source_count')
        .eq('language_code', code)
        .in('normalized_word', words.slice(index, index + 750));
      if (error) throw error;
      frequencyRows.push(...((data ?? []) as FrequencyRow[]));
    }

    const ranked: RankedCandidate[] = frequencyRows
      .filter((row) => row.frequency_rank > cutoff)
      .map((row) => {
        const occurrence = seen.get(row.normalized_word)!;
        return {
          ...row,
          word: occurrence.word,
          occurrences: occurrence.occurrences,
          context: sentenceAround(sourceText, occurrence.position),
        };
      })
      .sort(
        (left, right) =>
          left.frequency_rank - right.frequency_rank ||
          right.occurrences - left.occurrences,
      );
    const eligibleCount = ranked.length;
    const proposed = ranked.slice(0, requestedCount);
    if (!proposed.length) {
      await failRun('NO_ELIGIBLE_VOCABULARY');
      return json({
        provider: 'frequency',
        model: 'OpenSubtitles2018',
        inputWordCount,
        eligibleCount,
        items: [],
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      await failRun('AI_NOT_CONFIGURED');
      return json(
        {
          code: 'AI_NOT_CONFIGURED',
          message: 'Vocabulary extraction is not configured yet.',
        },
        503,
      );
    }
    const prompt = `You enrich pre-selected vocabulary cards. The words were selected deterministically from a frequency list: they are above the learner's assumed ${learnerLevel} vocabulary threshold, ordered from most useful to less frequent. Do not add, replace, or reorder words. Return JSON only: {"items":[{"word":"exact candidate word","lemma":"dictionary lemma","translation":"translation in ${nativeLanguage}","partOfSpeech":"part of speech","level":"CEFR estimate","context":"copy the supplied context sentence","confidence":"High or Medium"}]}. Exclude a candidate only when it is clearly a proper name, a malformed token, or cannot be translated usefully. Do not return a full chapter translation.\n\nCANDIDATES:\n${JSON.stringify(
      proposed.map(({ word, frequency_rank, context }) => ({
        word,
        frequencyRank: frequency_rank,
        context,
      })),
    )}`;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' +
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
    if (response.status === 429) {
      await failRun('AI_QUOTA_EXCEEDED');
      return json(
        {
          code: 'AI_QUOTA_EXCEEDED',
          message:
            'Vocabulary extraction is temporarily unavailable because the AI usage limit was reached. Please try again later.',
        },
        429,
      );
    }
    if (response.status === 503) {
      await failRun('AI_TEMPORARILY_UNAVAILABLE');
      return json(
        {
          code: 'AI_TEMPORARILY_UNAVAILABLE',
          message:
            'The vocabulary service is temporarily busy. Please retry in a moment.',
        },
        503,
      );
    }
    if (!response.ok) {
      await failRun('AI_PROVIDER_ERROR');
      return json(
        {
          code: 'AI_PROVIDER_ERROR',
          message:
            'The vocabulary service returned an error. Your chapter was not changed.',
        },
        502,
      );
    }
    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('AI_EMPTY_RESPONSE');
    let parsed: { items?: unknown[] };
    try {
      parsed = JSON.parse(responseText) as { items?: unknown[] };
    } catch {
      await failRun('AI_INVALID_RESPONSE');
      return json(
        {
          code: 'AI_INVALID_RESPONSE',
          message:
            'The vocabulary service returned an unreadable result. Please retry.',
        },
        502,
      );
    }

    const proposedByWord = new Map(
      proposed.map((candidate) => [normalizeWord(candidate.word), candidate]),
    );
    const used = new Set<string>();
    const items = (parsed.items ?? [])
      .map((item) => {
        const value = asRecord(item);
        const word = typeof value?.word === 'string' ? value.word : '';
        const candidate = proposedByWord.get(normalizeWord(word));
        if (!candidate || used.has(candidate.normalized_word)) return null;
        const translation =
          typeof value?.translation === 'string'
            ? value.translation.trim()
            : '';
        if (!translation) return null;
        used.add(candidate.normalized_word);
        return {
          word: candidate.word,
          lemma:
            typeof value?.lemma === 'string'
              ? value.lemma.trim() || null
              : null,
          translation,
          partOfSpeech:
            typeof value?.partOfSpeech === 'string'
              ? value.partOfSpeech.trim() || 'word'
              : 'word',
          level:
            typeof value?.level === 'string'
              ? value.level.trim() || learnerLevel
              : learnerLevel,
          context: candidate.context,
          confidence: value?.confidence === 'High' ? 'High' : 'Medium',
          frequencyRank: candidate.frequency_rank,
          sourceCount: candidate.source_count,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    if (!items.length) {
      await failRun('AI_INVALID_RESPONSE');
      return json(
        {
          code: 'AI_INVALID_RESPONSE',
          message:
            'The vocabulary service returned no usable suggestions. Please retry.',
        },
        502,
      );
    }

    const { data: savedItems, error: candidateError } = await admin
      .from('vocabulary_candidates')
      .insert(
        items.map((item) => ({
          extraction_run_id: runId,
          word: item.word,
          lemma: item.lemma,
          translation: item.translation,
          part_of_speech: item.partOfSpeech,
          cefr_level: item.level,
          context: item.context,
          confidence: item.confidence,
          frequency_rank: item.frequencyRank,
          source_count: item.sourceCount,
        })),
      )
      .select(
        'id, word, lemma, translation, part_of_speech, cefr_level, context, confidence, frequency_rank',
      );
    if (candidateError) throw candidateError;
    await Promise.all([
      admin
        .from('extraction_runs')
        .update({ status: 'complete', completed_at: new Date().toISOString() })
        .eq('id', runId),
      admin
        .from('chapters')
        .update({ extraction_status: 'complete' })
        .eq('id', chapterId),
    ]);
    return json({
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      inputWordCount,
      eligibleCount,
      items: (savedItems ?? []).map((item) => ({
        id: String(item.id),
        word: String(item.word),
        lemma: item.lemma ? String(item.lemma) : null,
        translation: String(item.translation),
        partOfSpeech: String(item.part_of_speech ?? 'word'),
        level: String(item.cefr_level ?? learnerLevel),
        context: String(item.context ?? ''),
        confidence: item.confidence === 'High' ? 'High' : 'Medium',
        frequencyRank: Number(item.frequency_rank),
      })),
    });
  } catch (error) {
    await failRun('INTERNAL_ERROR');
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
