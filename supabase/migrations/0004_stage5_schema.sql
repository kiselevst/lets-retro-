-- Let's Retro — этап 5: поддержка добавления карточек и голосования.

alter table cards alter column position type bigint;

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
