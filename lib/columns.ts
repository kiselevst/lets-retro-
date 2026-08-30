import { supabase } from './supabase';
import type { ColumnUpdate } from './types';

export async function updateColumn(columnId: string, patch: ColumnUpdate): Promise<void> {
  const { error } = await supabase.from('columns').update(patch).eq('id', columnId);
  if (error) throw error;
}
