'use client';

import { useState, type DragEvent } from 'react';
import type { CardRow, VoteRow, ColumnKey } from '@/lib/types';
import type { StoredParticipant } from '@/lib/participant';

interface CardProps {
  card: CardRow;
  authorName: string;
  participant: StoredParticipant;
  votes: VoteRow[];
  votingDisabled: boolean;
  allowSelfVote: boolean;
  remainingVotes: number;
  columnKey: ColumnKey;
  locked: boolean;
  isRemoteHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onToggleVote: () => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
  onCreateAction: () => void;
  onOpenSmart: () => void;
  onToggleDone: () => void;
  onMergeDrop: (sourceCardId: string) => void;
}

export function Card({
  card,
  authorName,
  participant,
  votes,
  votingDisabled,
  allowSelfVote,
  remainingVotes,
  columnKey,
  locked,
  isRemoteHovered,
  onHoverStart,
  onHoverEnd,
  onToggleVote,
  onEdit,
  onDelete,
  onCreateAction,
  onOpenSmart,
  onToggleDone,
  onMergeDrop,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);
  const [dragOver, setDragOver] = useState(false);

  const isOwner = card.author_participant_id === participant.participantId;
  const canManage = !locked && (isOwner || participant.role === 'moderator');
  const voteCount = votes.filter((v) => v.card_id === card.id).length;
  const iVoted = votes.some(
    (v) => v.card_id === card.id && v.participant_id === participant.participantId,
  );
  const selfVoteBlocked = isOwner && !allowSelfVote;
  const canVote = !locked && !votingDisabled && !selfVoteBlocked && (remainingVotes > 0 || iVoted);
  const isMerged = Boolean(card.merged_into);
  const canDrag = !locked && !isMerged && !editing;
  const hasSmart = Boolean(card.smart_success || card.smart_owner || card.smart_deadline);

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== card.id) onMergeDrop(sourceId);
  }

  if (editing) {
    function handleSaveEdit() {
      const trimmed = draft.trim();
      if (trimmed) onEdit(trimmed);
      setEditing(false);
    }

    return (
      <div className="rounded-lg border border-line bg-panel p-3.5 shadow-panel">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSaveEdit();
            }
          }}
          maxLength={500}
          rows={3}
          autoFocus
          className="w-full resize-none rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSaveEdit}
            className="rounded-md bg-amber px-3 py-1.5 text-xs font-semibold text-amber-ink hover:brightness-110"
          >
            Сохранить
          </button>
          <button
            onClick={() => {
              setDraft(card.text);
              setEditing(false);
            }}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        if (!locked && !isMerged) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`rounded-lg border p-3.5 shadow-panel transition-colors ${
        dragOver ? 'border-amber' : isRemoteHovered ? 'border-amber ring-2 ring-amber/60' : 'border-line'
      } bg-panel ${card.done && columnKey === 'actions' ? 'opacity-60' : ''}`}
    >
      {columnKey === 'actions' && card.done && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/20 px-2.5 py-0.5 font-mono text-[11px] text-teal">
          ✓ Готово
        </div>
      )}

      {columnKey === 'actions' && hasSmart ? (
        <div className="flex flex-col gap-1 text-sm text-ink">
          <p>
            <span className="text-ink-dim">Задача: </span>
            {card.text}
          </p>
          {card.smart_success && (
            <p>
              <span className="text-ink-dim">Успех: </span>
              {card.smart_success}
            </p>
          )}
          {card.smart_owner && (
            <p>
              <span className="text-ink-dim">Кто: </span>
              {card.smart_owner}
            </p>
          )}
          {card.smart_deadline && (
            <p>
              <span className="text-ink-dim">Срок: </span>
              {card.smart_deadline}
            </p>
          )}
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{card.text}</p>
      )}

      {card.sources.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5 border-l-2 border-line pl-2 text-[11px] text-ink-dim">
          {card.sources.map((s, i) => (
            <p key={i}>
              «{s.text}» — {s.author}
            </p>
          ))}
        </div>
      )}

      {isMerged && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 font-mono text-[11px] text-amber">
          🎯 Стало экшеном
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-ink-dim">
        <span>{authorName}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVote}
            disabled={!canVote}
            title={selfVoteBlocked ? 'Голосование за свои карточки отключено' : undefined}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              iVoted
                ? 'border-teal bg-teal/20 text-teal'
                : 'border-line bg-white/5 text-ink hover:bg-white/10'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            ▲ {voteCount}
          </button>

          {columnKey === 'actions' && !locked && (
            <>
              <button
                onClick={onOpenSmart}
                className="text-ink-dim hover:text-ink"
                title="Оформить по SMART"
              >
                📋
              </button>
              <button
                onClick={onToggleDone}
                className="text-ink-dim hover:text-teal"
                title={card.done ? 'Вернуть в работу' : 'Отметить выполненным'}
              >
                {card.done ? '↺' : '✓'}
              </button>
            </>
          )}

          {columnKey !== 'actions' && !locked && !isMerged && (
            <button
              onClick={onCreateAction}
              className="text-ink-dim hover:text-ink"
              title="Создать задачу"
            >
              🎯
            </button>
          )}

          {canManage && (
            <>
              <button
                onClick={() => {
                  setDraft(card.text);
                  setEditing(true);
                }}
                className="text-ink-dim hover:text-ink"
                title="Редактировать"
              >
                ✎
              </button>
              <button onClick={onDelete} className="text-ink-dim hover:text-coral" title="Удалить">
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
