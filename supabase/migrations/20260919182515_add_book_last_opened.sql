alter table public.books
  add column last_opened_at timestamptz;

update public.books
set last_opened_at = created_at
where last_opened_at is null;

alter table public.books
  alter column last_opened_at set not null,
  alter column last_opened_at set default now();

create index books_user_id_last_opened_at_idx
  on public.books (user_id, last_opened_at desc);
