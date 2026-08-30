import { supabase } from './supabase';
import type { BoardSettingsUpdate } from './types';

export async function updateBoardSettings(
  boardId: string,
  patch: BoardSettingsUpdate,
): Promise<void> {
  const { error } = await supabase.from('board_settings').update(patch).eq('board_id', boardId);
  if (error) throw error;
}
