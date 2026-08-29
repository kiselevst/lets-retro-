-- Let's Retro — включаем Supabase Realtime для таблиц, нужных на этапе 4.
--
-- По умолчанию publication `supabase_realtime` пустая — без явного добавления
-- таблицы подписки postgres_changes на неё просто не будут получать события,
-- при этом ни в клиенте, ни в консоли Supabase это не выглядит как ошибка —
-- тишина. Поэтому важно не забыть этот шаг для каждой новой таблицы, которую
-- начинаем слушать в реальном времени.
--
-- Оборачиваем в проверку через pg_publication_tables, чтобы миграцию можно
-- было безопасно прогнать повторно (ALTER PUBLICATION ... ADD TABLE падает
-- с ошибкой, если таблица уже добавлена).

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
