'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBoardData } from '@/hooks/useBoardData';
import { updateBoardSettings } from '@/lib/boardSettings';
import { updateColumn, updateAllColumnsStyle } from '@/lib/columns';
import { resetVotes, clearBoard, deleteBoard } from '@/lib/board';
import type { SortOrder, ColumnRow, ColumnStyle } from '@/lib/types';

const FALLBACK_COLOR_HEX = '#8A9099';

const COLOR_OPTIONS: { id: string; hex: string; label: string }[] = [
  { id: 'green', hex: '#3FB56D', label: 'Зелёный' },
  { id: 'red', hex: '#E5534B', label: 'Красный' },
  { id: 'purple', hex: '#9B6BD9', label: 'Фиолетовый' },
  { id: 'blue', hex: '#4C8DE5', label: 'Синий' },
  { id: 'cyan', hex: '#3FC1D6', label: 'Голубой' },
  { id: 'orange', hex: '#E8963D', label: 'Оранжевый' },
  { id: 'brown', hex: '#A17953', label: 'Коричневый' },
  { id: 'gray', hex: FALLBACK_COLOR_HEX, label: 'Серый' },
];

interface SettingsPatch {
  allow_self_vote?: boolean;
  voting_disabled?: boolean;
  hide_author?: boolean;
  hide_votes?: boolean;
  highlight_mode?: boolean;
  votes_per_participant?: number;
  sort_order?: SortOrder;
}

interface SettingsContentProps {
  boardId: string;
  onClose: () => void;
}

export function SettingsContent({ boardId, onClose }: SettingsContentProps) {
  const router = useRouter();
  const { columns, settings, loading } = useBoardData(boardId);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function updateSetting(patch: SettingsPatch) {
    try {
      await updateBoardSettings(boardId, patch);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResetVotes() {
    if (!window.confirm('Сбросить все голоса на доске?')) return;
    setBusy(true);
    try {
      await resetVotes(boardId);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearBoard() {
    if (!window.confirm('Удалить все карточки на доске без возможности восстановления?')) return;
    setBusy(true);
    try {
      await clearBoard(boardId);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteBoard() {
    if (!window.confirm('Удалить доску целиком безвозвратно? Это действие нельзя отменить.')) {
      return;
    }
    setBusy(true);
    try {
      await deleteBoard(boardId);
      router.push('/');
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  }

  if (loading || !settings) {
    return <div className="p-6 text-sm text-ink-dim">Загрузка настроек…</div>;
  }

  // Стиль карточек хранится в columns.style, но это единая настройка на всю
  // доску — читаем по первому столбцу, а обновляем все разом, чтобы они не
  // разъезжались друг с другом.
  const cardStyle: ColumnStyle = columns[0]?.style ?? 'border';

  async function handleCardStyleChange(style: ColumnStyle) {
    try {
      await updateAllColumnsStyle(boardId, style);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex max-h-[85vh] flex-col overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Настройки ретро</h2>
        <button onClick={onClose} className="text-ink-dim hover:text-ink">
          ✕
        </button>
      </div>

      <div className="flex flex-col divide-y divide-line border-y border-line">
        <SettingRow
          label="Голосовать за свои карточки"
          checked={settings.allow_self_vote}
          onChange={(v) => updateSetting({ allow_self_vote: v })}
        />
        <SettingRow
          label="Отключить голосование"
          checked={settings.voting_disabled}
          onChange={(v) => updateSetting({ voting_disabled: v })}
        />
        <SettingRow
          label="Скрыть авторов карточек"
          checked={settings.hide_author}
          onChange={(v) => updateSetting({ hide_author: v })}
        />
        <SettingRow
          label="Скрыть количество голосов"
          checked={settings.hide_votes}
          onChange={(v) => updateSetting({ hide_votes: v })}
        />
        <SettingRow
          label="Подсветка при наведении"
          checked={settings.highlight_mode}
          onChange={(v) => updateSetting({ highlight_mode: v })}
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-ink-dim">Голосов на участника</span>
        <VotesStepper
          value={settings.votes_per_participant}
          onChange={(v) => updateSetting({ votes_per_participant: v })}
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-ink-dim">Порядок карточек</span>
        <select
          value={settings.sort_order}
          onChange={(e) => updateSetting({ sort_order: e.target.value as SortOrder })}
          className="rounded-lg border border-line bg-bg-soft px-3 py-1.5 text-sm text-ink outline-none focus:border-amber"
        >
          <option value="date">По дате</option>
          <option value="votes">По голосам</option>
          <option value="author">По автору</option>
          <option value="random">Случайно</option>
        </select>
      </div>

      <div className="mt-2 border-t border-line pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Столбцы</h3>
          <CardStyleSwitch value={cardStyle} onChange={handleCardStyleChange} />
        </div>
        <div className="flex flex-col gap-2">
          {columns.map((col) => (
            <ColumnSettingsRow
              key={col.id}
              column={col}
              isEditing={editingColumnId === col.id}
              onEdit={() => setEditingColumnId(col.id)}
              onDone={() => setEditingColumnId(null)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <Link
          href="/history"
          className="text-xs text-ink-dim underline decoration-dotted hover:text-ink"
        >
          🕘 Мои доски (история)
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-line pt-4">
        <button
          disabled={busy}
          onClick={handleResetVotes}
          className="text-xs text-ink-dim underline decoration-dotted hover:text-ink disabled:opacity-40"
        >
          Сбросить голоса
        </button>
        <button
          disabled={busy}
          onClick={handleClearBoard}
          className="text-xs text-ink-dim underline decoration-dotted hover:text-ink disabled:opacity-40"
        >
          Очистить доску
        </button>
        <button
          disabled={busy}
          onClick={handleDeleteBoard}
          className="text-xs text-coral underline decoration-dotted hover:brightness-125 disabled:opacity-40"
        >
          Удалить доску
        </button>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  // Локальное состояние переключается сразу по клику, не дожидаясь ответа
  // сети (запрос в Supabase → Realtime → перезапрос данных — это
  // ощутимая задержка, 0.5-1 сек). useEffect подхватывает реальное
  // значение из базы, когда оно приходит — в норме оно просто совпадает с
  // тем, что уже показано, а если кто-то другой успел поменять эту же
  // настройку почти одновременно, синхронизация всё равно произойдёт.
  const [localChecked, setLocalChecked] = useState(checked);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  function handleChange(next: boolean) {
    setLocalChecked(next);
    onChange(next);
  }

  return (
    <label className="flex cursor-pointer items-center justify-between py-3 text-sm text-ink">
      <span>{label}</span>
      <span className="relative inline-flex h-5 w-9 items-center">
        <input
          type="checkbox"
          checked={localChecked}
          onChange={(e) => handleChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full border border-line bg-bg-soft transition-colors peer-checked:border-amber peer-checked:bg-amber/30" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-ink-dim transition-transform peer-checked:translate-x-4 peer-checked:bg-amber" />
      </span>
    </label>
  );
}

function CardStyleSwitch({
  value,
  onChange,
}: {
  value: ColumnStyle;
  onChange: (style: ColumnStyle) => void;
}) {
  // Тот же приём, что и в SettingRow — мгновенный локальный отклик вместо
  // ожидания цикла запрос-Realtime-перезапрос.
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(next: ColumnStyle) {
    setLocalValue(next);
    onChange(next);
  }

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-line">
      <button
        type="button"
        onClick={() => handleChange('border')}
        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
          localValue === 'border' ? 'bg-amber text-amber-ink' : 'bg-bg-soft text-ink-dim hover:text-ink'
        }`}
      >
        Обводка
      </button>
      <button
        type="button"
        onClick={() => handleChange('filled')}
        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
          localValue === 'filled' ? 'bg-amber text-amber-ink' : 'bg-bg-soft text-ink-dim hover:text-ink'
        }`}
      >
        Заливка
      </button>
    </div>
  );
}

function VotesStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(next: number) {
    const clamped = Math.min(20, Math.max(1, next));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => commit((parseInt(draft, 10) || value) - 1)}
        className="h-8 w-8 rounded-lg border border-line bg-bg-soft text-ink hover:brightness-125"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
        onBlur={() => commit(parseInt(draft, 10) || value)}
        className="w-12 rounded-lg border border-line bg-bg-soft px-2 py-1.5 text-center text-sm text-ink outline-none focus:border-amber"
      />
      <button
        type="button"
        onClick={() => commit((parseInt(draft, 10) || value) + 1)}
        className="h-8 w-8 rounded-lg border border-line bg-bg-soft text-ink hover:brightness-125"
      >
        +
      </button>
    </div>
  );
}

function ColumnSettingsRow({
  column,
  isEditing,
  onEdit,
  onDone,
}: {
  column: ColumnRow;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(column.title);
  const [description, setDescription] = useState(column.description);
  const [color, setColor] = useState(column.color);

  useEffect(() => {
    setTitle(column.title);
    setDescription(column.description);
    setColor(column.color);
  }, [column.title, column.description, column.color]);

  async function handleSave() {
    try {
      await updateColumn(column.id, {
        title: title.trim() || column.title,
        description,
        color,
      });
    } catch (err) {
      console.error(err);
    } finally {
      onDone();
    }
  }

  // Без обращения к массиву по индексу (COLOR_OPTIONS[N]) — при включённом
  // noUncheckedIndexedAccess в tsconfig такой доступ типизируется как
  // "возможно undefined", даже если по факту индекс всегда в границах.
  const hex = COLOR_OPTIONS.find((c) => c.id === color)?.hex ?? FALLBACK_COLOR_HEX;

  if (!isEditing) {
    return (
      <button
        onClick={onEdit}
        className="flex items-center justify-between rounded-lg border border-line bg-bg-soft px-3 py-2 text-left text-sm text-ink hover:brightness-110"
      >
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} />
          {column.title}
        </span>
        <span className="text-ink-dim">⚙</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber bg-bg-soft p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={60}
        placeholder="Название столбца"
        className="rounded-md border border-line bg-panel px-2 py-1.5 text-sm text-ink outline-none focus:border-amber"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder="Описание (необязательно)"
        className="resize-none rounded-md border border-line bg-panel px-2 py-1.5 text-sm text-ink outline-none focus:border-amber"
      />
      <div className="flex flex-wrap gap-1.5">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            onClick={() => setColor(c.id)}
            className={`h-6 w-6 rounded-full ${
              color === c.id ? 'ring-2 ring-ink ring-offset-2 ring-offset-bg-soft' : ''
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="rounded-md bg-amber px-3 py-1.5 text-xs font-semibold text-amber-ink hover:brightness-110"
        >
          Сохранить
        </button>
        <button
          onClick={onDone}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
