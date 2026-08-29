import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ColumnRow, BoardSettingsRow } from '@/lib/types';

export function useBoardData(boardId: string) {
  const [columns, setColumns] = useState<ColumnRow[]>([]);
  const [settings, setSettings] = useState<BoardSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const [{ data: columnsData }, { data: settingsData }] = await Promise.all([
        supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
        supabase.from('board_settings').select('*').eq('board_id', boardId).maybeSingle(),
      ]);
      if (!active) return;
      setColumns((columnsData ?? []) as ColumnRow[]);
      setSettings((settingsData ?? null) as BoardSettingsRow | null);
      setLoading(false);
    }

    load();

    // Простая и надёжная стратегия для MVP: при любом изменении просто
    // перезапрашиваем всё заново, а не пытаемся аккуратно патчить локальное
    // состояние по типу события. Для размеров одной ретро-доски (единицы
    // столбцов) разница в производительности не имеет значения.
    const channel = supabase
      .channel(`board-data-${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
        () => load(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'board_settings',
          filter: `board_id=eq.${boardId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  return { columns, settings, loading };
}
