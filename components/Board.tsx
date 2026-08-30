'use client';

import { useState } from 'react';
import { useBoardData } from '@/hooks/useBoardData';
import { useCards } from '@/hooks/useCards';
import { useParticipants } from '@/hooks/useParticipants';
import { useVotes } from '@/hooks/useVotes';
import {
  addCard,
  updateCardText,
  deleteCard,
  mergeCards,
  createActionFromCard,
  saveSmart,
  toggleCardDone,
} from '@/lib/cards';
import { castVote, removeVote } from '@/lib/votes';
import { completeRetro } from '@/lib/board';
import type { StoredParticipant } from '@/lib/participant';
import type { CardRow } from '@/lib/types';
import { Column } from './Column';
import { SmartModal } from './SmartModal';

interface BoardProps {
  boardId: string;
  participant: StoredParticipant;
}

export function Board({ boardId, participant }: BoardProps) {
  const { columns, settings, loading: columnsLoading } = useBoardData(boardId);
  const { cards, loading: cardsLoading } = useCards(boardId);
  const participants = useParticipants(boardId);
  const { votes } = useVotes(boardId);
  const [smartModalCard, setSmartModalCard] = useState<CardRow | null>(null);

  const participantNameById = new Map(participants.map((p) => [p.id, p.name]));

  const votesLimit = settings?.votes_per_participant ?? 5;
  const votingDisabled = settings?.voting_disabled ?? false;
  const allowSelfVote = settings?.allow_self_vote ?? false;
  const isCompleted = settings?.completed ?? false;
  const myVotesUsed = votes.filter((v) => v.participant_id === participant.participantId).length;
  const remainingVotes = votesLimit - myVotesUsed;

  function authorNameFor(card: CardRow): string {
    return card.author_participant_id
      ? (participantNameById.get(card.author_participant_id) ?? 'Аноним')
      : 'Аноним';
  }

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

  async function handleMergeCards(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const source = cards.find((c) => c.id === sourceId);
    const target = cards.find((c) => c.id === targetId);
    if (!source || !target) return;
    if (source.column_id !== target.column_id) return;
    if (source.merged_into || target.merged_into) return;
    try {
      await mergeCards(source, target, authorNameFor(source));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateAction(source: CardRow) {
    const actionsColumn = columns.find((c) => c.key === 'actions');
    if (!actionsColumn || source.merged_into) return;
    try {
      const newCard = await createActionFromCard(
        boardId,
        actionsColumn.id,
        source,
        participant.participantId,
        authorNameFor(source),
      );
      setSmartModalCard(newCard);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveSmart(fields: {
    text: string;
    smartSuccess: string;
    smartOwner: string;
    smartDeadline: string;
  }) {
    if (!smartModalCard) return;
    try {
      await saveSmart(smartModalCard.id, fields);
    } catch (err) {
      console.error(err);
    } finally {
      setSmartModalCard(null);
    }
  }

  async function handleToggleDone(card: CardRow) {
    try {
      await toggleCardDone(card.id, !card.done);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCompleteRetro() {
    const confirmed = window.confirm(
      'Завершить ретро? После этого редактировать можно будет только колонку «Что делаем».',
    );
    if (!confirmed) return;
    try {
      await completeRetro(boardId);
    } catch (err) {
      console.error(err);
    }
  }

  if (columnsLoading || cardsLoading) {
    return <div className="flex-1 p-8 text-center text-sm text-ink-dim">Загружаем доску…</div>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bg-soft px-6 py-2.5">
        <span className="text-xs text-ink-dim">
          {isCompleted
            ? '✅ Ретро завершено — редактировать можно только «Что делаем»'
            : 'Перетащите карточку на другую в этом же столбце, чтобы объединить их'}
        </span>
        {participant.role === 'moderator' && !isCompleted && (
          <button
            onClick={handleCompleteRetro}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink hover:brightness-125"
          >
            🏁 Ретро закончилось
          </button>
        )}
      </div>

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
            locked={isCompleted && column.key !== 'actions'}
            onAddCard={(text) => addCard(boardId, column.id, participant.participantId, text)}
            onToggleVote={handleToggleVote}
            onEditCard={(cardId, text) => updateCardText(cardId, text)}
            onDeleteCard={(cardId) => deleteCard(cardId)}
            onCreateAction={handleCreateAction}
            onOpenSmart={(card) => setSmartModalCard(card)}
            onToggleDoneCard={handleToggleDone}
            onMergeCards={handleMergeCards}
          />
        ))}
      </div>

      {smartModalCard && (
        <SmartModal
          card={smartModalCard}
          onSave={handleSaveSmart}
          onClose={() => setSmartModalCard(null)}
        />
      )}
    </>
  );
}
