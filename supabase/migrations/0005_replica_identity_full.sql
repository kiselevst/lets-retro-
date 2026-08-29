-- Let's Retro — фикс Realtime для DELETE-событий.
--
-- По умолчанию Postgres кладёт в лог репликации при DELETE только первичный
-- ключ удалённой строки (REPLICA IDENTITY DEFAULT). Мы фильтруем подписки
-- Realtime по board_id, которого в таком урезанном наборе нет — из-за этого
-- Supabase Realtime не может сопоставить удалённую строку с фильтром, и
-- событие удаления либо теряется, либо доставляется только "заодно" со
-- следующим успешным событием. Симптом: удаление карточки/снятие голоса
-- зависает и появляется с большой задержкой или после любого другого действия.
--
-- FULL заставляет Postgres класть в лог всю строку, а не только id — тогда
-- фильтр по board_id работает и на DELETE тоже.

alter table cards replica identity full;
alter table votes replica identity full;
alter table columns replica identity full;
alter table board_settings replica identity full;
alter table participants replica identity full;
