import { supabase } from './supabase';

export async function castVote(
  boardId: string,
  cardId: string,
  participantId: string,
): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .insert({ board_id: boardId, card_id: cardId, participant_id: participantId });
  if (error) throw error;
}

export async function removeVote(cardId: string, participantId: string): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('card_id', cardId)
    .eq('participant_id', participantId);
  if (error) throw error;
}
