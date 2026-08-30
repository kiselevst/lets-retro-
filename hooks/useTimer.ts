import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimerStateRow } from '@/lib/types';

export function useTimer(boardId: string) {
  const [timer, setTimer] = useState<TimerStateRow | null>(null);
  const [instanceId] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from('timer_state')
        .select('*')
        .eq('board_id', boardId)
        .maybeSingle();
      if (!active) return;
      setTimer((data ?? null) as TimerStateRow | null);
    }

    load();

    const channel = supabase
      .channel(`timer-${boardId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timer_state', filter: `board_id=eq.${boardId}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [boardId, instanceId]);

  return timer;
}
