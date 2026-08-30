'use client';

import { useState } from 'react';
import type { ColumnRow, CardRow, VoteRow } from '@/lib/types';
import type { StoredParticipant } from '@/lib/participant';
import { Card } from './Card';

const COLOR_HEX: Record<string, string> = {
  green: '#3FB56D',
  red: '#E5534B',
  purple: '#9B6BD9',
  blue: '#4C8DE5',
  cyan: '#3FC1D6',
  orange: '#E8963D',
  brown: '#A17953',
  gray: '#8A9099',
};

interface ColumnProps {
  column: ColumnRow;
  cards: CardRow[];
  participantNameById: Map<string, string>;
  participant: StoredParticipant;
  votes: VoteRow[];
  votingDisabled: boolean;
  allowSelfVote: boolean;
  remainingVotes: number;
  locked: boolean;
  remoteHoveredCardId: string | null;
  onCardHover: (cardId: string | null) => void;
  onAddCard: (text: string) => Promise<void> | void;
  onToggleVote: (cardId: string, isOwner: boolean) => void;
  onEditCard: (cardId: string, text: string) => void;
  onDeleteCard: (cardId: string) => void;
  onCreateAction: (card: CardRow) => void;
  onOpenSmart: (card: CardRow) => void;
  onToggleDoneCard: (card: CardRow) => void;
  onMergeCards: (sourceId: string, targetId: string) => void;
}

export function Column({
  column,
  cards,
  participantNameById,
  participant,
  votes,
  votingDisabled,
  allowSelfVote,
  remainingVotes,
  locked,
  remoteHoveredCardId,
  onCardHover,
  onAddCard,
  onToggleVote,
  onEditCard,
  onDeleteCard,
  onCreateAction,
  onOpenSmart,
  onToggleDoneCard,
  onMergeCards,
}: ColumnProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const hex = COLOR_HEX[column.color] ?? COLOR_HEX.gray;

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await onAddCard(trimmed);
    setDraft('');
    setComposerOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl px-4 py-3 font-display text-sm font-bold"
        style={{ backgroundColor: `${hex}26`, color: hex }}
      >
        {column.title}
      </div>
      {column.description && <p className="px-1 text-xs text-ink-dim">{column.description}</p>}

      {locked ? (
        <p className="rounded-lg border border-line bg-btn-add-bg px-3 py-2.5 text-xs text-ink-dim">
          Ретро завершено — столбец только для чтения.
        </p>
      ) : !composerOpen ? (
        <button
          onClick={() => setComposerOpen(true)}
          className="w-full rounded-lg border border-line bg-btn-add-bg px-3 py-2.5 text-sm font-semibold text-ink hover:brightness-125"
        >
          + Добавить
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-btn-add-bg p-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            maxLength={500}
            placeholder="Введите текст карточки..."
            rows={3}
            autoFocus
            className="resize-none rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-amber px-3 py-1.5 text-xs font-semibold text-amber-ink hover:brightness-110"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setDraft('');
                setComposerOpen(false);
              }}
              className="rounded-md border border-line px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {cards.length === 0 && <p className="px-1 text-sm text-ink-dim">Пока пусто.</p>}
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            authorName={
              card.author_participant_id
                ? (participantNameById.get(card.author_participant_id) ?? '—')
                : '—'
            }
            participant={participant}
            votes={votes}
            votingDisabled={votingDisabled}
            allowSelfVote={allowSelfVote}
            remainingVotes={remainingVotes}
            columnKey={column.key}
            locked={locked}
            isRemoteHovered={remoteHoveredCardId === card.id}
            onHoverStart={() => onCardHover(card.id)}
            onHoverEnd={() => onCardHover(null)}
            onToggleVote={() =>
              onToggleVote(card.id, card.author_participant_id === participant.participantId)
            }
            onEdit={(text) => onEditCard(card.id, text)}
            onDelete={() => onDeleteCard(card.id)}
            onCreateAction={() => onCreateAction(card)}
            onOpenSmart={() => onOpenSmart(card)}
            onToggleDone={() => onToggleDoneCard(card)}
            onMergeDrop={(sourceId) => onMergeCards(sourceId, card.id)}
          />
        ))}
      </div>
    </div>
  );
}
