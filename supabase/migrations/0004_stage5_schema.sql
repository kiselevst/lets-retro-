-- Let's Retro — этап 5: поддержка добавления карточек и голосования.

-- position карточек формируется на клиенте как Date.now() (мс с эпохи) —
-- простой монотонный порядок без лишнего запроса "текущий максимум + 1".
-- int (int4) переполняется задолго до текущих значений Date.now(), поэтому
-- расширяем до bigint.
alter table cards alter column position type bigint;

-- Денормализуем board_id на votes — как и у cards/columns/participants,
-- это даёт единообразную фильтрацию по board_id (в том числе для Realtime)
-- без join с cards только чтобы посчитать голоса участника на доске.
alter table votes add column board_id uuid references boards(id) on delete cascade;
alter table votes alter column board_id set not null;
create index idx_votes_board on votes(board_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table votes;
  end if;
end $$;
