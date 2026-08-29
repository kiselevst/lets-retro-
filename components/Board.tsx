'use client';

import { useBoardData } from '@/hooks/useBoardData';
import { useCards } from '@/hooks/useCards';
import { useParticipants } from '@/hooks/useParticipants';
import { useVotes } from '@/hooks/useVotes';
import { addCard, updateCardText, deleteCard } from '@/lib/cards';
import { castVote, removeVote } from '@/lib/votes';
import type { StoredParticipant } from '@/lib/participant';
import { Column } from './Column';

interface BoardProps {
  boardId: string;
  participant: StoredParticipant;
}

export function Board({ boardId, participant }: BoardProps) {
  const { columns, settings, loading: columnsLoading } = useBoardData(boardId);
  const { cards, loading: cardsLoading } = useCards(boardId);
  const participants = useParticipants(boardId);
  const { votes } = useVotes(boardId);

  const participantNameById = new Map(participants.map((p) => [p.id, p.name]));

  const votesLimit = settings?.votes_per_participant ?? 5;
  const votingDisabled = settings?.voting_disabled ?? false;
  const allowSelfVote = settings?.allow_self_vote ?? false;
  const myVotesUsed = votes.filter((v) => v.participant_id === participant.participantId).length;
  const remainingVotes = votesLimit - myVotesUsed;

  async function handleToggleVote(cardId: string, isOwner: boolean) {
    if (votingDisabled) return;
    if (isOwner && !allowSelfVote) return;
    const existing = votes.find(
      (v) => v.card_id === cardId && v.participant_id === participant.participantId,
    );
    if (existing) {
      await removeVote(cardId, participant.participantId);
    } else {
      if (remainingVotes <= 0) return;
      await castVote(boardId, cardId, participant.participantId);
    }
  }

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
          participant={participant}
          votes={votes}
          votingDisabled={votingDisabled}
          allowSelfVote={allowSelfVote}
          remainingVotes={remainingVotes}
          onAddCard={(text) => addCard(boardId, column.id, participant.participantId, text)}
          onToggleVote={handleToggleVote}
          onEditCard={(cardId, text) => updateCardText(cardId, text)}
          onDeleteCard={(cardId) => deleteCard(cardId)}
        />
      ))}
    </div>
  );
}
