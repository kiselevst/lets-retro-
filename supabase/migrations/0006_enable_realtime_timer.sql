-- Let's Retro — этап 7: Realtime для таймера.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'timer_state'
  ) then
    alter publication supabase_realtime add table timer_state;
  end if;
end $$;
