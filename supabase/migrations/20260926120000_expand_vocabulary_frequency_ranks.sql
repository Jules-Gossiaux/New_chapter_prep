alter table public.vocabulary_frequency
  drop constraint vocabulary_frequency_frequency_rank_check,
  add constraint vocabulary_frequency_frequency_rank_check
    check (frequency_rank between 1 and 15000);

alter table public.vocabulary_candidates
  drop constraint vocabulary_candidates_frequency_rank_check,
  add constraint vocabulary_candidates_frequency_rank_check
    check (frequency_rank between 1 and 15000);
