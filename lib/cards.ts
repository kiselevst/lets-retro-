import { supabase } from './supabase';

export async function addCard(
  boardId: string,
  columnId: string,
  participantId: string,
  text: string,
): Promise<void> {
  const { error } = await supabase.from('cards').insert({
    board_id: boardId,
    column_id: columnId,
    author_participant_id: participantId,
    text,
    position: Date.now(),
  });
  if (error) throw error;
}

export async function updateCardText(cardId: string, text: string): Promise<void> {
  const { error } = await supabase.from('cards').update({ text }).eq('id', cardId);
  if (error) throw error;
}

export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) throw error;
}
