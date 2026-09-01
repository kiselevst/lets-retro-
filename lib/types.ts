// Ручные типы под схему из supabase/migrations/. Не сгенерированы через
// `supabase gen types`, чтобы не тащить в MVP лишний тул — структура 1:1
// повторяет миграции. Если схема меняется, поправить нужно только этот файл.

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

/**
 * Снимок состояния прямо перед последней склейкой — всё, что нужно, чтобы
 * честно разъединить карточки обратно: текст цели до склейки и кто за что
 * голосовал. Хранится только для ПОСЛЕДНЕЙ склейки (не полная история).
 */
export interface MergeUndoSnapshot {
  targetTextBefore: string;
  targetVoterIds: string[];
  source: {
    text: string;
    author: string;
    authorParticipantId: string | null;
    voterIds: string[];
    createdAt: string;
    color: string | null;
  };
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
  last_merge_snapshot: MergeUndoSnapshot | null;
  position: number;
  created_at: string;
  updated_at: string;
}
export type CardInsert = Pick<CardRow, 'board_id' | 'column_id' | 'text' | 'position'> &
  Partial<CardRow>;
export type CardUpdate = Partial<CardInsert>;

export interface VoteRow {
  id: string;
  board_id: string;
  card_id: string;
  participant_id: string;
  created_at: string;
}
export type VoteInsert = Pick<VoteRow, 'board_id' | 'card_id' | 'participant_id'> &
  Partial<VoteRow>;
export type VoteUpdate = Partial<VoteInsert>;

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
