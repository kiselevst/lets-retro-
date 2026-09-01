'use client';

import { useState, type DragEvent } from 'react';
import { Triangle, Target, Pencil, X } from 'lucide-react';
import type { CardRow, VoteRow, ColumnKey, ColumnStyle } from '@/lib/types';
import type { StoredParticipant } from '@/lib/participant';

interface CardProps {
  card: CardRow;
  authorName: string;
  participant: StoredParticipant;
  votes: VoteRow[];
  votingDisabled: boolean;
  allowSelfVote: boolean;
  remainingVotes: number;
  hideAuthor: boolean;
  hideVotes: boolean;
  revealed: boolean;
  columnKey: ColumnKey;
  columnColorHex: string;
  columnStyle: ColumnStyle;
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
  onUnmerge: () => void;
}

export function Card({
  card,
  authorName,
  participant,
  votes,
  votingDisabled,
  allowSelfVote,
  remainingVotes,
  hideAuthor,
  hideVotes,
  revealed,
  columnKey,
  columnColorHex,
  columnStyle,
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
  onUnmerge,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);
  const [dragOver, setDragOver] = useState(false);

  const isOwner = card.author_participant_id === participant.participantId;
  // Пока модератор не нажал "Показать карточки" — содержимое чужих карточек
  // спрятано под блюром. Свою карточку видно всегда. Модератор не является
  // исключением — он тоже не должен видеть чужие карточки раньше времени.
  const hideContent = !revealed && !isOwner;

  const canDelete = !locked && (isOwner || participant.role === 'moderator');
  const canEdit = !locked && !hideContent && (isOwner || participant.role === 'moderator');

  const voteCount = votes.filter((v) => v.card_id === card.id).length;
  const iVoted = votes.some(
    (v) => v.card_id === card.id && v.participant_id === participant.participantId,
  );
  const selfVoteBlocked = isOwner && !allowSelfVote;
  const canVote = !locked && !votingDisabled && !selfVoteBlocked && (remainingVotes > 0 || iVoted);
  const isMerged = Boolean(card.merged_into);
  const canDrag = !locked && !isMerged && !editing && !hideContent;
  const hasSmart = Boolean(card.smart_success || card.smart_owner || card.smart_deadline);
  const canUnmerge =
    !locked && !hideContent && Boolean(card.last_merge_snapshot) && (isOwner || participant.role === 'moderator');

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
          style={{ '--focus-color': columnColorHex } as React.CSSProperties}
          className="w-full resize-none rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-[var(--focus-color)]"
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

  const authorLabel = hideAuthor ? '—' : authorName;
  // Отключённое голосование прячет и счётчик тоже — иначе на карточках
  // остаются "зависшие" цифры голосов, хотя голосовать уже нельзя.
  // Цифра голосов (обычный текст) остаётся эталоном размера — именно её
  // размер и берём за образец для остальных иконок ниже.
  // Прозрачность вместе с блюром, а не просто blur — иначе на светлой теме
  // (тёмный текст поверх белой панели) размытие даёт резкий, высококонтрастный
  // мазок. С пониженной непрозрачностью эффект мягкий в обеих темах.
  const contentClass = hideContent ? 'select-none blur-sm opacity-40' : '';

  // Индикаторы drag&drop/подсветки важнее цвета темы столбца — пока карточку
  // тащат или на неё наводят курсор, её обводка всегда амбер, вне зависимости
  // от настройки "обводка/заливка".
  const showInteractionBorder = dragOver || isRemoteHovered;
  const cardStyle: React.CSSProperties = {};
  if (!showInteractionBorder && columnStyle === 'border') {
    cardStyle.borderColor = columnColorHex;
  }
  if (columnStyle === 'filled') {
    cardStyle.backgroundColor = `${columnColorHex}1F`;
  }

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        if (!locked && !isMerged && !hideContent) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={cardStyle}
      className={`rounded-lg border p-3.5 shadow-panel transition-colors ${
        showInteractionBorder
          ? `border-amber${isRemoteHovered ? ' ring-2 ring-amber/60' : ''}`
          : columnStyle === 'border'
            ? ''
            : 'border-line'
      } ${columnStyle === 'filled' ? '' : 'bg-panel'} ${card.done && columnKey === 'actions' ? 'opacity-60' : ''}`}
    >
      {columnKey === 'actions' && card.done && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/20 px-2.5 py-0.5 font-mono text-[11px] text-teal">
          ✓ Готово
        </div>
      )}

      {columnKey === 'actions' && hasSmart ? (
        <div className={`flex flex-col gap-1 text-sm text-ink ${contentClass}`}>
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
        <p className={`whitespace-pre-wrap text-sm leading-relaxed text-ink ${contentClass}`}>
          {card.text}
        </p>
      )}

      {!hideContent && card.sources.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5 border-l-2 border-line pl-2 text-[11px] text-ink-dim">
          {card.sources.map((s, i) => (
            <p key={i}>
              «{s.text}» — {s.author}
            </p>
          ))}
        </div>
      )}

      {!hideContent && isMerged && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 font-mono text-[11px] text-amber">
          🎯 Стало экшеном
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] leading-none text-ink-dim">
        <span>{authorLabel}</span>
        <div className="flex items-center gap-2">
          {!votingDisabled && (
            <button
              onClick={onToggleVote}
              disabled={!canVote}
              title={selfVoteBlocked ? 'Голосование за свои карточки отключено' : undefined}
              className={`flex items-center gap-1 text-[11px] leading-none transition-colors ${
                iVoted ? 'text-teal' : 'text-ink-dim hover:text-ink'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Triangle className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
              {!hideVotes && voteCount}
            </button>
          )}

          {canUnmerge && (
            <button
              onClick={onUnmerge}
              className="text-[11px] leading-none text-ink-dim hover:text-ink"
              title="Разъединить (отменить последнюю склейку)"
            >
              🔀
            </button>
          )}

          {columnKey === 'actions' && !locked && !hideContent && (
            <>
              <button
                onClick={onOpenSmart}
                className="text-[11px] leading-none text-ink-dim hover:text-ink"
                title="Оформить по SMART"
              >
                📋
              </button>
              <button
                onClick={onToggleDone}
                className="text-[11px] leading-none text-ink-dim hover:text-teal"
                title={card.done ? 'Вернуть в работу' : 'Отметить выполненным'}
              >
                {card.done ? '↺' : '✓'}
              </button>
            </>
          )}

          {columnKey !== 'actions' && !locked && !isMerged && !hideContent && (
            <button
              onClick={onCreateAction}
              className="flex items-center text-[11px] leading-none text-ink-dim hover:text-ink"
              title="Создать задачу"
            >
              <Target className="h-2.5 w-2.5" />
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => {
                setDraft(card.text);
                setEditing(true);
              }}
              className="flex items-center text-[11px] leading-none text-ink-dim hover:text-ink"
              title="Редактировать"
            >
              <Pencil className="h-2.5 w-2.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="flex items-center text-[11px] leading-none text-ink-dim hover:text-coral"
              title="Удалить"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
