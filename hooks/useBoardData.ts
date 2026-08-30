import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ColumnRow, BoardSettingsRow } from '@/lib/types';

export function useBoardData(boardId: string) {
  const [columns, setColumns] = useState<ColumnRow[]>([]);
  const [settings, setSettings] = useState<BoardSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  // Уникальный "хвост" на каждый экземпляр хука: доска (Board) и модалка
  // настроек (SettingsContent) могут одновременно слушать одну и ту же
  // доску. Supabase возвращает уже существующий канал, если имя совпадает,
  // а добавлять .on(...) на уже подписанный канал нельзя — отсюда и нужна
  // уникальность имени, а не просто boardId.
  const [instanceId] = useState(() => Math.random().toString(36).slice(2));

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

    const channel = supabase
      .channel(`board-data-${boardId}-${instanceId}`)
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
  }, [boardId, instanceId]);

  return { columns, settings, loading };
}
