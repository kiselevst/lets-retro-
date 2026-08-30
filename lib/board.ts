import { supabase } from './supabase';
import { generateBoardCode } from './codes';
import type { ColumnKey } from './types';

const DEFAULT_COLUMNS: Array<{ key: ColumnKey; title: string; color: string; position: number }> = [
  { key: 'well', title: 'Что было хорошо', color: 'green', position: 0 },
  { key: 'notwell', title: 'Что хочется улучшить', color: 'orange', position: 1 },
  { key: 'actions', title: 'Что делаем', color: 'purple', position: 2 },
];

export interface CreateBoardParams {
  boardName: string;
  moderatorName: string;
  votesPerParticipant: number;
}

export interface CreateBoardResult {
  boardId: string;
  participantId: string;
}

export async function createBoard({
  boardName,
  moderatorName,
  votesPerParticipant,
}: CreateBoardParams): Promise<CreateBoardResult> {
  // Код доски должен быть уникальным. Коллизия почти невозможна (5 символов
  // из 32-буквенного алфавита), но на всякий случай пробуем несколько раз,
  // а не падаем с ошибкой при первом же совпадении.
  let boardId: string | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5 && !boardId; attempt++) {
    const { data, error } = await supabase
      .from('boards')
      .insert({ code: generateBoardCode(), name: boardName })
      .select('id')
      .single();
    if (error) {
      lastError = error;
      continue;
    }
    boardId = data.id;
  }
  if (!boardId) {
    throw lastError instanceof Error ? lastError : new Error('Не удалось создать доску');
  }

  const { error: settingsError } = await supabase
    .from('board_settings')
    .insert({ board_id: boardId, votes_per_participant: votesPerParticipant });
  if (settingsError) throw settingsError;

  const { error: timerError } = await supabase.from('timer_state').insert({ board_id: boardId });
  if (timerError) throw timerError;

  const { error: columnsError } = await supabase
    .from('columns')
    .insert(DEFAULT_COLUMNS.map((column) => ({ ...column, board_id: boardId })));
  if (columnsError) throw columnsError;

  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({ board_id: boardId, name: moderatorName, role: 'moderator' })
    .select('id')
    .single();
  if (participantError) throw participantError;

  return { boardId, participantId: participant.id };
}

export async function findBoardIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('id')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

export async function joinBoardAsParticipant(boardId: string, name: string): Promise<string> {
  const { data, error } = await supabase
    .from('participants')
    .insert({ board_id: boardId, name, role: 'participant' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function completeRetro(boardId: string): Promise<void> {
  const { error } = await supabase
    .from('board_settings')
    .update({ completed: true })
    .eq('board_id', boardId);
  if (error) throw error;
}

export async function resetVotes(boardId: string): Promise<void> {
  const { error } = await supabase.from('votes').delete().eq('board_id', boardId);
  if (error) throw error;
}

export async function clearBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('board_id', boardId);
  if (error) throw error;
}

// boards удаляется одним запросом — participants/board_settings/timer_state/
// columns/cards (а через cards ещё и votes) уже настроены с "on delete
// cascade" ещё в самой первой миграции, так что чистить их по отдельности
// не нужно.
export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from('boards').delete().eq('id', boardId);
  if (error) throw error;
}
