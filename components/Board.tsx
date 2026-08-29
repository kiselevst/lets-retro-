'use client';

import { useBoardData } from '@/hooks/useBoardData';
import { useCards } from '@/hooks/useCards';
import { useParticipants } from '@/hooks/useParticipants';
import { Column } from './Column';

interface BoardProps {
  boardId: string;
}

export function Board({ boardId }: BoardProps) {
  const { columns, loading: columnsLoading } = useBoardData(boardId);
  const { cards, loading: cardsLoading } = useCards(boardId);
  const participants = useParticipants(boardId);

  const participantNameById = new Map(participants.map((p) => [p.id, p.name]));

  if (columnsLoading || cardsLoading) {
    return <div className="flex-1 p-8 text-center text-sm text-ink-dim">Загружаем доску…</div>;
  }

  return (
    <div className="grid flex-1 grid-cols-1 gap-5 p-6 md:grid-cols-3">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          cards={cards.filter((c) => c.column_id === column.id)}
          participantNameById={participantNameById}
        />
      ))}
    </div>
  );
}
