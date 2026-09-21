-- Deliberately deny Data API reads: only the Edge Function's service-role
-- client may use the reference data. A false policy documents this intent and
-- avoids an ambiguous RLS-without-policy configuration.
create policy "reference frequency is server only"
on public.vocabulary_frequency
for select
to anon, authenticated
using (false);
