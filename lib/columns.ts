import { supabase } from './supabase';
import type { ColumnUpdate, ColumnStyle } from './types';

export async function updateColumn(columnId: string, patch: ColumnUpdate): Promise<void> {
  const { error } = await supabase.from('columns').update(patch).eq('id', columnId);
  if (error) throw error;
}

// Стиль карточек — единая настройка на всю доску (не по столбцам отдельно),
// поэтому меняем сразу все строки columns одним запросом.
export async function updateAllColumnsStyle(boardId: string, style: ColumnStyle): Promise<void> {
  const { error } = await supabase.from('columns').update({ style }).eq('board_id', boardId);
  if (error) throw error;
}
