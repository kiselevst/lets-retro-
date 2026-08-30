import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { VoteRow } from '@/lib/types';

export function useVotes(boardId: string) {
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [instanceId] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.from('votes').select('*').eq('board_id', boardId);
      if (!active) return;
      setVotes((data ?? []) as VoteRow[]);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`votes-${boardId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `board_id=eq.${boardId}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [boardId, instanceId]);

  return { votes, loading };
}
