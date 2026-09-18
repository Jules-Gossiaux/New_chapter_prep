-- Reference frequency data remains server-only: RLS has no client policies,
-- while the Edge Function uses the Supabase service-role key at runtime.
create table public.vocabulary_frequency (
  language_code text not null check (language_code in ('en', 'fr')),
  normalized_word text not null check (char_length(normalized_word) > 0),
  frequency_rank integer not null check (frequency_rank between 1 and 10000),
  source_count bigint not null check (source_count >= 0),
  source_name text not null default 'OpenSubtitles2018',
  source_version text not null default 'orgtre/top-open-subtitles-sentences',
  primary key (language_code, normalized_word),
  unique (language_code, frequency_rank)
);

alter table public.vocabulary_frequency enable row level security;
revoke all on table public.vocabulary_frequency from anon, authenticated;
grant select, insert, update, delete on table public.vocabulary_frequency to service_role;

alter table public.chapters
  drop constraint chapters_word_count_check,
  add constraint chapters_word_count_check check (word_count between 1 and 50000);

alter table public.extraction_runs
  drop constraint extraction_runs_input_word_count_check,
  add constraint extraction_runs_input_word_count_check check (input_word_count between 1 and 50000);

alter table public.vocabulary_candidates
  add column frequency_rank integer check (frequency_rank between 1 and 10000),
  add column source_count bigint check (source_count >= 0);

create index vocabulary_frequency_language_rank_idx
  on public.vocabulary_frequency (language_code, frequency_rank);
