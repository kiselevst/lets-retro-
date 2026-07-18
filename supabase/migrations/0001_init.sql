-- Let's Retro — initial schema
-- RLS и политики доступа добавляются отдельной миграцией на этапе 2.

create extension if not exists "pgcrypto";

create table boards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  name text not null,
  role text not null check (role in ('moderator', 'participant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table board_settings (
  board_id uuid primary key references boards(id) on delete cascade,
  votes_per_participant int not null default 5,
  revealed boolean not null default false,
  hide_votes boolean not null default false,
  hide_author boolean not null default false,
  voting_disabled boolean not null default false,
  allow_self_vote boolean not null default false,
  highlight_mode boolean not null default false,
  sort_order text not null default 'date' check (sort_order in ('date', 'votes', 'author', 'random')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table timer_state (
  board_id uuid primary key references boards(id) on delete cascade,
  ends_at timestamptz,
  total_seconds int,
  updated_at timestamptz not null default now()
);

create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  key text not null check (key in ('well', 'notwell', 'actions')),
  title text not null,
  description text not null default '',
  color text not null default 'gray',
  style text not null default 'border' check (style in ('filled', 'border')),
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (board_id, key)
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  column_id uuid not null references columns(id) on delete cascade,
  author_participant_id uuid references participants(id) on delete set null,
  text text not null,
  color text,
  done boolean not null default false,
  merged_into uuid references cards(id) on delete set null,
  sources jsonb not null default '[]'::jsonb,
  smart_success text,
  smart_owner text,
  smart_deadline date,
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (card_id, participant_id)
);

-- Индексы под самые частые запросы (всё почти всегда фильтруется по board_id)
create index idx_participants_board on participants(board_id);
create index idx_columns_board on columns(board_id);
create index idx_cards_board on cards(board_id);
create index idx_cards_column on cards(column_id);
create index idx_votes_card on votes(card_id);

-- Общий триггер updated_at, чтобы не дублировать логику в каждой таблице
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_boards_updated_at before update on boards
  for each row execute function set_updated_at();
create trigger trg_participants_updated_at before update on participants
  for each row execute function set_updated_at();
create trigger trg_board_settings_updated_at before update on board_settings
  for each row execute function set_updated_at();
create trigger trg_timer_state_updated_at before update on timer_state
  for each row execute function set_updated_at();
create trigger trg_columns_updated_at before update on columns
  for each row execute function set_updated_at();
create trigger trg_cards_updated_at before update on cards
  for each row execute function set_updated_at();
