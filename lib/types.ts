// Ручные типы под схему из supabase/migrations/0001_init.sql.
// Не сгенерированы через `supabase gen types`, чтобы не тащить в MVP лишний тул —
// но структура 1:1 повторяет миграцию. Если схема поменяется, поправить нужно
// только этот файл (и, если появилось поле, миграцию).
//
// Важно: форма ниже (Relationships на каждой таблице, Views/Functions/Enums/
// CompositeTypes на уровне схемы) — не декоративная, а именно то, что ожидает
// @supabase/supabase-js для корректного вывода типов у .insert()/.update().
// Без Relationships библиотека не может сопоставить тип и типизирует insert
// как never[], что и происходило в билде.

export type ParticipantRole = 'moderator' | 'participant';
export type ColumnKey = 'well' | 'notwell' | 'actions';
export type ColumnStyle = 'filled' | 'border';
export type CardColor = 'green' | 'red' | 'purple' | 'blue' | 'cyan' | 'orange' | 'brown' | 'gray';
export type SortOrder = 'date' | 'votes' | 'author' | 'random';

export interface BoardRow {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}
export type BoardInsert = Pick<BoardRow, 'code' | 'name'> & Partial<BoardRow>;
export type BoardUpdate = Partial<BoardInsert>;

export interface ParticipantRow {
  id: string;
  board_id: string;
  name: string;
  role: ParticipantRole;
  created_at: string;
  updated_at: string;
}
export type ParticipantInsert = Pick<ParticipantRow, 'board_id' | 'name' | 'role'> &
  Partial<ParticipantRow>;
export type ParticipantUpdate = Partial<ParticipantInsert>;

export interface BoardSettingsRow {
  board_id: string;
  votes_per_participant: number;
  revealed: boolean;
  hide_votes: boolean;
  hide_author: boolean;
  voting_disabled: boolean;
  allow_self_vote: boolean;
  highlight_mode: boolean;
  sort_order: SortOrder;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
export type BoardSettingsInsert = Pick<BoardSettingsRow, 'board_id'> &
  Partial<BoardSettingsRow>;
export type BoardSettingsUpdate = Partial<BoardSettingsInsert>;

export interface TimerStateRow {
  board_id: string;
  ends_at: string | null;
  total_seconds: number | null;
  updated_at: string;
}
export type TimerStateInsert = Pick<TimerStateRow, 'board_id'> & Partial<TimerStateRow>;
export type TimerStateUpdate = Partial<TimerStateInsert>;

export interface ColumnRow {
  id: string;
  board_id: string;
  key: ColumnKey;
  title: string;
  description: string;
  color: CardColor | string;
  style: ColumnStyle;
  position: number;
  created_at: string;
  updated_at: string;
}
export type ColumnInsert = Pick<ColumnRow, 'board_id' | 'key' | 'title' | 'position'> &
  Partial<ColumnRow>;
export type ColumnUpdate = Partial<ColumnInsert>;

export interface CardSource {
  text: string;
  author: string;
}

export interface CardRow {
  id: string;
  board_id: string;
  column_id: string;
  author_participant_id: string | null;
  text: string;
  color: CardColor | string | null;
  done: boolean;
  merged_into: string | null;
  sources: CardSource[];
  smart_success: string | null;
  smart_owner: string | null;
  smart_deadline: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}
export type CardInsert = Pick<CardRow, 'board_id' | 'column_id' | 'text' | 'position'> &
  Partial<CardRow>;
export type CardUpdate = Partial<CardInsert>;

export interface VoteRow {
  id: string;
  card_id: string;
  participant_id: string;
  created_at: string;
}
export type VoteInsert = Pick<VoteRow, 'card_id' | 'participant_id'> & Partial<VoteRow>;
export type VoteUpdate = Partial<VoteInsert>;

// Generic-тип для createClient<Database>(...) — форма ниже соответствует тому,
// что генерирует `supabase gen types typescript`, это важно для корректного
// вывода типов внутри supabase-js (см. комментарий вверху файла).
export interface Database {
  public: {
    Tables: {
      boards: { Row: BoardRow; Insert: BoardInsert; Update: BoardUpdate; Relationships: [] };
      participants: {
        Row: ParticipantRow;
        Insert: ParticipantInsert;
        Update: ParticipantUpdate;
        Relationships: [];
      };
      board_settings: {
        Row: BoardSettingsRow;
        Insert: BoardSettingsInsert;
        Update: BoardSettingsUpdate;
        Relationships: [];
      };
      timer_state: {
        Row: TimerStateRow;
        Insert: TimerStateInsert;
        Update: TimerStateUpdate;
        Relationships: [];
      };
      columns: { Row: ColumnRow; Insert: ColumnInsert; Update: ColumnUpdate; Relationships: [] };
      cards: { Row: CardRow; Insert: CardInsert; Update: CardUpdate; Relationships: [] };
      votes: { Row: VoteRow; Insert: VoteInsert; Update: VoteUpdate; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Удобные составные типы для использования в компонентах/хуках дальше по проекту.
export interface BoardWithSettings extends BoardRow {
  settings: BoardSettingsRow;
  timer: TimerStateRow | null;
  columns: ColumnRow[];
}

export interface CardWithVotes extends CardRow {
  voteCount: number;
  myVote: boolean;
}
