revoke execute on function public.handle_new_user() from public;

alter policy "profiles own row" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "books own rows" on public.books
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "chapters follow owned books" on public.chapters
  using (exists (
    select 1 from public.books
    where books.id = chapters.book_id and books.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.books
    where books.id = chapters.book_id and books.user_id = (select auth.uid())
  ));

alter policy "runs follow owned chapters" on public.extraction_runs
  using (exists (
    select 1 from public.chapters
    join public.books on books.id = chapters.book_id
    where chapters.id = extraction_runs.chapter_id and books.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.chapters
    join public.books on books.id = chapters.book_id
    where chapters.id = extraction_runs.chapter_id and books.user_id = (select auth.uid())
  ));

alter policy "candidates follow owned runs" on public.vocabulary_candidates
  using (exists (
    select 1 from public.extraction_runs
    join public.chapters on chapters.id = extraction_runs.chapter_id
    join public.books on books.id = chapters.book_id
    where extraction_runs.id = vocabulary_candidates.extraction_run_id
      and books.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.extraction_runs
    join public.chapters on chapters.id = extraction_runs.chapter_id
    join public.books on books.id = chapters.book_id
    where extraction_runs.id = vocabulary_candidates.extraction_run_id
      and books.user_id = (select auth.uid())
  ));

alter policy "vocabulary own rows" on public.vocabulary_entries
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "chapter vocabulary follows ownership" on public.chapter_vocabulary
  using (exists (
    select 1 from public.chapters
    join public.books on books.id = chapters.book_id
    where chapters.id = chapter_vocabulary.chapter_id
      and books.user_id = (select auth.uid())
  ))
  with check (
    exists (
      select 1 from public.chapters
      join public.books on books.id = chapters.book_id
      where chapters.id = chapter_vocabulary.chapter_id
        and books.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.vocabulary_entries
      where vocabulary_entries.id = chapter_vocabulary.vocabulary_entry_id
        and vocabulary_entries.user_id = (select auth.uid())
    )
  );

alter policy "progress own rows" on public.reading_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
