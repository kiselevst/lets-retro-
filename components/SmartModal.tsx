'use client';

import { useState } from 'react';
import type { CardRow } from '@/lib/types';

interface SmartFields {
  text: string;
  smartSuccess: string;
  smartOwner: string;
  smartDeadline: string;
}

interface SmartModalProps {
  card: CardRow;
  onSave: (fields: SmartFields) => void;
  onClose: () => void;
}

export function SmartModal({ card, onSave, onClose }: SmartModalProps) {
  const [text, setText] = useState(card.text);
  const [smartSuccess, setSmartSuccess] = useState(card.smart_success ?? '');
  const [smartOwner, setSmartOwner] = useState(card.smart_owner ?? '');
  const [smartDeadline, setSmartDeadline] = useState(card.smart_deadline ?? '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-panel p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 font-display text-lg font-bold">Оформить задачу по SMART</h3>
        <p className="mb-4 text-xs text-ink-dim">Можно пропустить и вернуться позже.</p>

        <label className="mb-3 flex flex-col gap-1 text-sm text-ink-dim">
          Что за задача
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={2}
            className="resize-none rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
        <label className="mb-3 flex flex-col gap-1 text-sm text-ink-dim">
          Что считается успехом
          <textarea
            value={smartSuccess}
            onChange={(e) => setSmartSuccess(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Необязательно"
            className="resize-none rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
        <label className="mb-3 flex flex-col gap-1 text-sm text-ink-dim">
          Кто делает
          <input
            value={smartOwner}
            onChange={(e) => setSmartOwner(e.target.value)}
            maxLength={100}
            placeholder="Необязательно"
            className="rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1 text-sm text-ink-dim">
          Какой срок
          <input
            type="date"
            value={smartDeadline}
            onChange={(e) => setSmartDeadline(e.target.value)}
            className="rounded-md border border-line bg-bg-soft p-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm text-ink-dim hover:text-ink"
          >
            Пропустить
          </button>
          <button
            onClick={() => {
              const trimmed = text.trim();
              if (!trimmed) return;
              onSave({
                text: trimmed,
                smartSuccess: smartSuccess.trim(),
                smartOwner: smartOwner.trim(),
                smartDeadline,
              });
            }}
            className="flex-1 rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-amber-ink hover:brightness-110"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
