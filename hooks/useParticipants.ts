import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ParticipantRow } from '@/lib/types';

export function useParticipants(boardId: string) {
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [instanceId] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.from('participants').select('*').eq('board_id', boardId);
      if (!active) return;
      setParticipants((data ?? []) as ParticipantRow[]);
    }

    load();

    const channel = supabase
      .channel(`participants-${boardId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `board_id=eq.${boardId}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [boardId, instanceId]);

  return participants;
}
