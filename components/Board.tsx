'use client';

import { useState } from 'react';
import { useBoardData } from '@/hooks/useBoardData';
import { useCards } from '@/hooks/useCards';
import { useParticipants } from '@/hooks/useParticipants';
import { useVotes } from '@/hooks/useVotes';
import { useTimer } from '@/hooks/useTimer';
import { useHoverBroadcast } from '@/hooks/useHoverBroadcast';
import {
  addCard,
  updateCardText,
  deleteCard,
  mergeCards,
  unmergeCard,
  createActionFromCard,
  saveSmart,
  toggleCardDone,
} from '@/lib/cards';
import { castVote, removeVote } from '@/lib/votes';
import { completeRetro } from '@/lib/board';
import { startTimer, stopTimer } from '@/lib/timer';
import { updateBoardSettings } from '@/lib/boardSettings';
import type { StoredParticipant } from '@/lib/participant';
import type { CardRow } from '@/lib/types';
import { Column } from './Column';
import { SmartModal } from './SmartModal';
import { Timer } from './Timer';
import { FinishRetroModal } from './FinishRetroModal';

interface BoardProps {
  boardId: string;
  board: { name: string; code: string };
  participant: StoredParticipant;
}

export function Board({ boardId, board, participant }: BoardProps) {
  const { columns, settings, loading: columnsLoading } = useBoardData(boardId);
  const { cards, loading: cardsLoading } = useCards(boardId);
  const participants = useParticipants(boardId);
  const { votes } = useVotes(boardId);
  const timer = useTimer(boardId);
  const [smartModalCard, setSmartModalCard] = useState<CardRow | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const participantNameById = new Map(participants.map((p) => [p.id, p.name]));

  const votesLimit = settings?.votes_per_participant ?? 5;
  const votingDisabled = settings?.voting_disabled ?? false;
  const allowSelfVote = settings?.allow_self_vote ?? false;
  const isCompleted = settings?.completed ?? false;
  const highlightMode = settings?.highlight_mode ?? false;
  const hideAuthor = settings?.hide_author ?? false;
  const hideVotes = settings?.hide_votes ?? false;
  const revealed = settings?.revealed ?? false;
  const myVotesUsed = votes.filter((v) => v.participant_id === participant.participantId).length;
  const remainingVotes = votesLimit - myVotesUsed;

  const { remoteHoveredCardId, broadcastHover } = useHoverBroadcast(
    boardId,
    participant.participantId,
    highlightMode,
  );

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
    const targetVoterIds = votes.filter((v) => v.card_id === targetId).map((v) => v.participant_id);
    const sourceVoterIds = votes.filter((v) => v.card_id === sourceId).map((v) => v.participant_id);
    try {
      await mergeCards(source, target, authorNameFor(source), targetVoterIds, sourceVoterIds);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUnmergeCard(card: CardRow) {
    try {
      await unmergeCard(boardId, card);
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

  async function handleToggleRevealed() {
    try {
      await updateBoardSettings(boardId, { revealed: !revealed });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStartTimer(minutes: number) {
    try {
      await startTimer(boardId, minutes);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStopTimer() {
    try {
      await stopTimer(boardId);
    } catch (err) {
      console.error(err);
    }
  }

  if (columnsLoading || cardsLoading) {
    return <div className="flex-1 p-8 text-center text-sm text-ink-dim">Загружаем доску…</div>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-soft px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-4">
          <Timer
            timer={timer}
            isModerator={participant.role === 'moderator'}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
          />
          <span className="text-xs text-ink-dim">
            {isCompleted
              ? '✅ Ретро завершено — редактировать можно только «Что делаем»'
              : revealed
                ? 'Карточки видны всем участникам'
                : 'Чужие карточки скрыты — видно, что что-то пишут, но не текст'}
          </span>
        </div>
        {participant.role === 'moderator' && !isCompleted && (
          <button
            onClick={handleToggleRevealed}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink hover:brightness-125"
          >
            {revealed ? '🙈 Скрыть карточки' : '👁 Показать карточки'}
          </button>
        )}
      </div>

      <div
        id="retro-board-capture"
        className="grid flex-1 grid-cols-1 gap-5 p-6 md:grid-cols-3"
      >
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
            hideAuthor={hideAuthor}
            hideVotes={hideVotes}
            revealed={revealed}
            locked={isCompleted && column.key !== 'actions'}
            remoteHoveredCardId={remoteHoveredCardId}
            onCardHover={broadcastHover}
            onAddCard={(text) => addCard(boardId, column.id, participant.participantId, text)}
            onToggleVote={handleToggleVote}
            onEditCard={(cardId, text) => updateCardText(cardId, text)}
            onDeleteCard={(cardId) => deleteCard(cardId)}
            onCreateAction={handleCreateAction}
            onOpenSmart={(card) => setSmartModalCard(card)}
            onToggleDoneCard={handleToggleDone}
            onMergeCards={handleMergeCards}
            onUnmergeCard={handleUnmergeCard}
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

      {/* Плавающая, левее иконки темы (та сидит в правом нижнем углу) —
          намеренно вынесена из общей панели сверху по отдельной просьбе.
          После завершения ретро сама кнопка "Ретро закончилось" больше не
          нужна (уже завершено) — на её месте появляется кнопка "Сохранить
          результат", открывающая ту же модалку сразу на экране сохранения,
          иначе после первого закрытия к JSON/PNG/ссылке было не вернуться. */}
      {participant.role === 'moderator' && !isCompleted && (
        <button
          onClick={() => setShowFinishModal(true)}
          className="fixed bottom-4 right-20 z-40 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink shadow-panel hover:brightness-125"
        >
          🏁 Ретро закончилось
        </button>
      )}
      {isCompleted && (
        <button
          onClick={() => setShowFinishModal(true)}
          className="fixed bottom-4 right-20 z-40 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink shadow-panel hover:brightness-125"
        >
          💾 Сохранить результат
        </button>
      )}

      {showFinishModal && (
        <FinishRetroModal
          boardId={boardId}
          boardName={board.name}
          startOnSaveScreen={isCompleted}
          onConfirm={async () => {
            await completeRetro(boardId);
          }}
          onClose={() => setShowFinishModal(false)}
        />
      )}
    </>
  );
}
