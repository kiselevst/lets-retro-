-- Let's Retro — включаем Realtime (postgres_changes) для таблиц, нужных на этапе 4.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'cards'
  ) then
    alter publication supabase_realtime add table cards;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'columns'
  ) then
    alter publication supabase_realtime add table columns;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'board_settings'
  ) then
    alter publication supabase_realtime add table board_settings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table participants;
  end if;
end $$;
