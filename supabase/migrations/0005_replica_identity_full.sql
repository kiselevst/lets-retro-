-- Let's Retro — фикс Realtime для DELETE-событий.
-- По умолчанию Postgres кладёт в лог репликации при DELETE только первичный
-- ключ удалённой строки. Фильтрация подписок по board_id (не по PK) не
-- срабатывает на DELETE без REPLICA IDENTITY FULL.

alter table cards replica identity full;
alter table votes replica identity full;
alter table columns replica identity full;
alter table board_settings replica identity full;
alter table participants replica identity full;
