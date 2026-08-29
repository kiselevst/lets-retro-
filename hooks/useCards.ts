import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CardRow } from '@/lib/types';

export function useCards(boardId: string) {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .order('position');
      if (!active) return;
      setCards((data ?? []) as CardRow[]);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`cards-${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  return { cards, loading };
}
