-- Let's Retro — Row Level Security
--
-- Осознанное упрощение для MVP (см. обсуждение): без Supabase Auth у Postgres нет
-- способа проверить, "кто" делает запрос — anon-ключ у всех участников один и тот же.
-- Поэтому политики ниже открытые (USING true) — это НЕ регресс относительно
-- прототипа на window.storage (там тоже не было проверки личности), просто
-- то же самое доверие, но теперь явно описанное в БД, а не отсутствующее вовсе.
--
-- Важно: именно поэтому RLS вынесен в отдельную миграцию, а не дописан в 0001 —
-- когда понадобится реальная защита (например, несколько модераторов или
-- Supabase Auth), меняется только этот файл, схема и код приложения не трогаются.

alter table boards enable row level security;
alter table participants enable row level security;
alter table board_settings enable row level security;
alter table timer_state enable row level security;
alter table columns enable row level security;
alter table cards enable row level security;
alter table votes enable row level security;

create policy "boards_open" on boards
  for all using (true) with check (true);

create policy "participants_open" on participants
  for all using (true) with check (true);

create policy "board_settings_open" on board_settings
  for all using (true) with check (true);

create policy "timer_state_open" on timer_state
  for all using (true) with check (true);

create policy "columns_open" on columns
  for all using (true) with check (true);

create policy "cards_open" on cards
  for all using (true) with check (true);

create policy "votes_open" on votes
  for all using (true) with check (true);
