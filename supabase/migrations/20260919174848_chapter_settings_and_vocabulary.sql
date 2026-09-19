-- A book's language is a default for new chapters. Extraction settings belong
-- to the chapter because a reader may study the same book at different levels.
alter table public.chapters
  add column target_language text,
  add column learner_level text;

update public.chapters as chapter
set
  target_language = book.target_language,
  learner_level = book.learner_level
from public.books as book
where book.id = chapter.book_id;

alter table public.chapters
  alter column target_language set not null,
  alter column learner_level set not null,
  alter column target_language set default 'English',
  alter column learner_level set default 'B1',
  add constraint chapters_target_language_check
    check (target_language in ('English', 'French')),
  add constraint chapters_learner_level_check
    check (learner_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));
