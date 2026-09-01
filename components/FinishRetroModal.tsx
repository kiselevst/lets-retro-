'use client';

import { useState } from 'react';
import { buildExportPayload, downloadExportFile } from '@/lib/archive';

interface FinishRetroModalProps {
  boardId: string;
  boardName: string;
  startOnSaveScreen?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function FinishRetroModal({
  boardId,
  boardName,
  startOnSaveScreen = false,
  onConfirm,
  onClose,
}: FinishRetroModalProps) {
  const [confirmed, setConfirmed] = useState(startOnSaveScreen);
  const [busy, setBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      setConfirmed(true);
    } catch (err) {
      console.error(err);
      setError('Не удалось завершить ретро. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadJson() {
    try {
      const payload = await buildExportPayload(boardId);
      downloadExportFile(payload);
    } catch (err) {
      console.error(err);
      setError('Не удалось собрать JSON.');
    }
  }

  async function handleDownloadPng() {
    try {
      const boardEl = document.getElementById('retro-board-capture');
      if (!boardEl) return;
      // Динамический импорт: библиотека нужна только в момент скачивания
      // картинки, незачем тащить её в общий бандл каждой страницы.
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(boardEl, {
        backgroundColor:
          getComputedStyle(document.body).getPropertyValue('--color-bg').trim() || '#1E2126',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const safeName = (boardName || 'retro').replace(/[^a-zA-Zа-яА-Я0-9 _-]/g, '').trim() || 'retro';
      a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError('Не удалось собрать картинку.');
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/r/${boardId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5">
      <div className="w-full max-w-md rounded-card border border-line bg-panel p-6 shadow-panel">
        {!confirmed ? (
          <>
            <h3 className="mb-2 font-display text-lg font-bold">Завершить ретро?</h3>
            <p className="mb-5 text-sm text-ink-dim">
              После этого редактировать можно будет только колонку «Что делаем».
            </p>
            {error && <p className="mb-3 text-xs text-coral">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-line px-4 py-2 text-sm text-ink-dim hover:text-ink"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="flex-1 rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-amber-ink hover:brightness-110 disabled:opacity-50"
              >
                {busy ? 'Завершаем...' : 'Завершить'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-2 font-display text-lg font-bold">✅ Ретро завершено</h3>
            <p className="mb-5 text-sm text-ink-dim">Сохрани результаты, пока доска перед глазами.</p>
            {error && <p className="mb-3 text-xs text-coral">{error}</p>}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadJson}
                className="rounded-lg border border-line bg-bg-soft px-4 py-2.5 text-left text-sm text-ink hover:brightness-110"
              >
                💾 Скачать JSON
              </button>
              <button
                onClick={handleDownloadPng}
                className="rounded-lg border border-line bg-bg-soft px-4 py-2.5 text-left text-sm text-ink hover:brightness-110"
              >
                🖼️ Скачать картинку (PNG)
              </button>
              <button
                onClick={handleCopyLink}
                className="rounded-lg border border-line bg-bg-soft px-4 py-2.5 text-left text-sm text-ink hover:brightness-110"
              >
                {linkCopied ? '✓ Ссылка скопирована' : '🔗 Скопировать ссылку'}
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-lg border border-line px-4 py-2 text-sm text-ink-dim hover:text-ink"
            >
              Готово
            </button>
          </>
        )}
      </div>
    </div>
  );
}
