import { supabase } from './supabase';

export async function startTimer(boardId: string, minutes: number): Promise<void> {
  const endsAt = new Date(Date.now() + minutes * 60_000).toISOString();
  const { error } = await supabase
    .from('timer_state')
    .update({ ends_at: endsAt, total_seconds: minutes * 60 })
    .eq('board_id', boardId);
  if (error) throw error;
}

export async function stopTimer(boardId: string): Promise<void> {
  const { error } = await supabase
    .from('timer_state')
    .update({ ends_at: null, total_seconds: null })
    .eq('board_id', boardId);
  if (error) throw error;
}
