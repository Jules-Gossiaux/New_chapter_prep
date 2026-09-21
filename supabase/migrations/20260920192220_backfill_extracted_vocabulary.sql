with latest_completed_runs as (
  select distinct on (extraction_runs.chapter_id)
    extraction_runs.id,
    extraction_runs.chapter_id
  from public.extraction_runs
  where extraction_runs.status = 'complete'
  order by
    extraction_runs.chapter_id,
    extraction_runs.completed_at desc nulls last,
    extraction_runs.created_at desc
), prepared_candidates as (
  select
    books.user_id,
    chapters.id as chapter_id,
    vocabulary_candidates.id as candidate_id,
    btrim(vocabulary_candidates.word) as word,
    vocabulary_candidates.translation,
    vocabulary_candidates.part_of_speech,
    vocabulary_candidates.context
  from latest_completed_runs
  join public.chapters on chapters.id = latest_completed_runs.chapter_id
  join public.books on books.id = chapters.book_id
  join public.vocabulary_candidates
    on vocabulary_candidates.extraction_run_id = latest_completed_runs.id
)
insert into public.vocabulary_entries (user_id, word, translation, notes)
select distinct on (user_id, word)
  user_id,
  word,
  translation,
  coalesce(part_of_speech, 'word')
from prepared_candidates
where word <> ''
order by user_id, word, candidate_id
on conflict (user_id, word) do nothing;

with latest_completed_runs as (
  select distinct on (extraction_runs.chapter_id)
    extraction_runs.id,
    extraction_runs.chapter_id
  from public.extraction_runs
  where extraction_runs.status = 'complete'
  order by
    extraction_runs.chapter_id,
    extraction_runs.completed_at desc nulls last,
    extraction_runs.created_at desc
), prepared_candidates as (
  select
    books.user_id,
    chapters.id as chapter_id,
    vocabulary_candidates.id as candidate_id,
    btrim(vocabulary_candidates.word) as word,
    vocabulary_candidates.context
  from latest_completed_runs
  join public.chapters on chapters.id = latest_completed_runs.chapter_id
  join public.books on books.id = chapters.book_id
  join public.vocabulary_candidates
    on vocabulary_candidates.extraction_run_id = latest_completed_runs.id
)
insert into public.chapter_vocabulary (
  chapter_id,
  vocabulary_entry_id,
  source_context
)
select
  prepared_candidates.chapter_id,
  vocabulary_entries.id,
  prepared_candidates.context
from prepared_candidates
join public.vocabulary_entries
  on vocabulary_entries.user_id = prepared_candidates.user_id
  and vocabulary_entries.word = prepared_candidates.word
where prepared_candidates.word <> ''
on conflict (chapter_id, vocabulary_entry_id) do update
  set source_context = excluded.source_context;

with latest_completed_runs as (
  select distinct on (extraction_runs.chapter_id)
    extraction_runs.id,
    extraction_runs.chapter_id
  from public.extraction_runs
  where extraction_runs.status = 'complete'
  order by
    extraction_runs.chapter_id,
    extraction_runs.completed_at desc nulls last,
    extraction_runs.created_at desc
)
update public.vocabulary_candidates
set is_accepted = true
from latest_completed_runs
where vocabulary_candidates.extraction_run_id = latest_completed_runs.id;
