'use client';

import { useState } from 'react';
import type { CardRow, VoteRow } from '@/lib/types';
import type { StoredParticipant } from '@/lib/participant';

interface CardProps {
  card: CardRow;
  authorName: string;
  participant: StoredParticipant;
  votes: VoteRow[];
  votingDisabled: boolean;
  allowSelfVote: boolean;
  remainingVotes: number;
  onToggleVote: () => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
}

export function Card({
  card,
  authorName,
  participant,
  votes,
  votingDisabled,
  allowSelfVote,
  remainingVotes,
  onToggleVote,
  onEdit,
  onDelete,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);

  const isOwner = card.author_participant_id === participant.participantId;
  const canManage = isOwner || participant.role === 'moderator';
  const voteCount = votes.filter((v) => v.card_id === card.id).length;
  const iVoted = votes.some(
    (v) => v.card_id === card.id && v.participant_id === participant.participantId,
  );
  const selfVoteBlocked = isOwner && !allowSelfVote;
  const canVote = !votingDisabled && !selfVoteBlocked && (remainingVotes > 0 || iVoted);

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
    <div className="rounded-lg border border-line bg-panel p-3.5 shadow-panel">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{card.text}</p>
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
              <button
                onClick={onDelete}
                className="text-ink-dim hover:text-coral"
                title="Удалить"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
