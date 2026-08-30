import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface HoverPayload {
  cardId: string | null;
  participantId: string;
}

export function useHoverBroadcast(boardId: string, participantId: string, enabled: boolean) {
  const [remoteHoveredCardId, setRemoteHoveredCardId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRemoteHoveredCardId(null);
      return;
    }

    // Важно: имя канала — ровно `hover-${boardId}`, БЕЗ уникального хвоста
    // на инстанс. В отличие от хуков, читающих БД (useBoardData, useCards и
    // т.д.), это broadcast-канал для обмена сигналами МЕЖДУ разными
    // участниками — все обязаны сидеть на одном и том же имени топика,
    // иначе просто перестанут видеть подсветку друг у друга.
    const channel = supabase
      .channel(`hover-${boardId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'hover' }, ({ payload }: { payload: HoverPayload }) => {
        if (payload.participantId === participantId) return;
        setRemoteHoveredCardId(payload.cardId);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [boardId, participantId, enabled]);

  function broadcastHover(cardId: string | null) {
    if (!enabled || !channelRef.current) return;
    if (lastSentRef.current === cardId) return;
    lastSentRef.current = cardId;
    channelRef.current.send({ type: 'broadcast', event: 'hover', payload: { cardId, participantId } });
  }

  return { remoteHoveredCardId, broadcastHover };
}
