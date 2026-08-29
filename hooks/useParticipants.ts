import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ParticipantRow } from '@/lib/types';

export function useParticipants(boardId: string) {
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.from('participants').select('*').eq('board_id', boardId);
      if (!active) return;
      setParticipants((data ?? []) as ParticipantRow[]);
    }

    load();

    const channel = supabase
      .channel(`participants-${boardId}`)
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
  }, [boardId]);

  return participants;
}
