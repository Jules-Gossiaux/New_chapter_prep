create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  native_language text not null default 'French',
  created_at timestamptz not null default now()
);
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  author text not null default '', target_language text not null,
  learner_level text not null default 'B1' check (learner_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.chapters (
  id uuid primary key default gen_random_uuid(), book_id uuid not null references public.books(id) on delete cascade,
  chapter_number integer not null check (chapter_number > 0), title text not null, source_text text not null,
  word_count integer not null check (word_count between 1 and 500),
  extraction_status text not null default 'not_started' check (extraction_status in ('not_started','pending','complete','failed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(book_id, chapter_number)
);
create table public.extraction_runs (
  id uuid primary key default gen_random_uuid(), chapter_id uuid not null references public.chapters(id) on delete cascade,
  provider text not null default 'gemini', model text not null default 'gemini-2.5-flash', requested_count integer not null check (requested_count > 0),
  input_word_count integer not null check (input_word_count between 1 and 500), status text not null check (status in ('pending','complete','failed')),
  error_code text, created_at timestamptz not null default now(), completed_at timestamptz
);
create table public.vocabulary_candidates (
  id uuid primary key default gen_random_uuid(), extraction_run_id uuid not null references public.extraction_runs(id) on delete cascade,
  word text not null, lemma text, translation text, part_of_speech text, cefr_level text, context text, confidence text,
  is_accepted boolean not null default false, created_at timestamptz not null default now()
);
create table public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  word text not null, lemma text, translation text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, word)
);
create table public.chapter_vocabulary (
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  vocabulary_entry_id uuid not null references public.vocabulary_entries(id) on delete cascade,
  source_context text, primary key (chapter_id, vocabulary_entry_id)
);
create table public.reading_progress (
  chapter_id uuid primary key references public.chapters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null default 0 check (position >= 0), completed boolean not null default false, updated_at timestamptz not null default now()
);

create index books_user_id_idx on public.books(user_id);
create index chapters_book_id_idx on public.chapters(book_id);
create index extraction_runs_chapter_id_idx on public.extraction_runs(chapter_id);
create index vocabulary_candidates_extraction_run_id_idx on public.vocabulary_candidates(extraction_run_id);
create index chapter_vocabulary_vocabulary_entry_id_idx on public.chapter_vocabulary(vocabulary_entry_id);
create index reading_progress_user_id_idx on public.reading_progress(user_id);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.extraction_runs enable row level security;
alter table public.vocabulary_candidates enable row level security;
alter table public.vocabulary_entries enable row level security;
alter table public.chapter_vocabulary enable row level security;
alter table public.reading_progress enable row level security;
create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "books own rows" on public.books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapters follow owned books" on public.chapters for all using (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid())) with check (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid()));
create policy "runs follow owned chapters" on public.extraction_runs for all using (exists (select 1 from public.chapters join public.books on books.id = chapters.book_id where chapters.id = extraction_runs.chapter_id and books.user_id = auth.uid())) with check (exists (select 1 from public.chapters join public.books on books.id = chapters.book_id where chapters.id = extraction_runs.chapter_id and books.user_id = auth.uid()));
create policy "candidates follow owned runs" on public.vocabulary_candidates for all using (exists (select 1 from public.extraction_runs join public.chapters on chapters.id = extraction_runs.chapter_id join public.books on books.id = chapters.book_id where extraction_runs.id = vocabulary_candidates.extraction_run_id and books.user_id = auth.uid())) with check (exists (select 1 from public.extraction_runs join public.chapters on chapters.id = extraction_runs.chapter_id join public.books on books.id = chapters.book_id where extraction_runs.id = vocabulary_candidates.extraction_run_id and books.user_id = auth.uid()));
create policy "vocabulary own rows" on public.vocabulary_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapter vocabulary follows ownership" on public.chapter_vocabulary for all using (exists (select 1 from public.chapters join public.books on books.id = chapters.book_id where chapters.id = chapter_vocabulary.chapter_id and books.user_id = auth.uid())) with check (exists (select 1 from public.chapters join public.books on books.id = chapters.book_id where chapters.id = chapter_vocabulary.chapter_id and books.user_id = auth.uid()) and exists (select 1 from public.vocabulary_entries where vocabulary_entries.id = chapter_vocabulary.vocabulary_entry_id and vocabulary_entries.user_id = auth.uid()));
create policy "progress own rows" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', '')); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
