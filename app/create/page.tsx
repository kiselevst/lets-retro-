'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBoard } from '@/lib/board';
import { storeParticipant } from '@/lib/participant';
import { addBoardToHistory } from '@/lib/history';

export default function CreateBoardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [moderatorName, setModeratorName] = useState('');
  const [votesInput, setVotesInput] = useState('5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function clampVotes(raw: number): number {
    if (!Number.isFinite(raw)) return 5;
    return Math.min(20, Math.max(1, raw));
  }

  function adjustVotes(delta: number) {
    const current = parseInt(votesInput, 10);
    const next = clampVotes((Number.isFinite(current) ? current : 5) + delta);
    setVotesInput(String(next));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const boardName = name.trim() || 'Ретроспектива команды';
      const modName = moderatorName.trim() || 'Модератор';
      const { boardId, participantId, code } = await createBoard({
        boardName,
        moderatorName: modName,
        votesPerParticipant: clampVotes(parseInt(votesInput, 10)),
      });
      storeParticipant(boardId, { participantId, name: modName, role: 'moderator' });
      addBoardToHistory({ boardId, name: boardName, code, createdAt: new Date().toISOString() });
      router.push(`/r/${boardId}`);
    } catch (err) {
      console.error(err);
      setError('Не удалось создать доску. Попробуйте ещё раз.');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-panel p-9 shadow-panel">
        <Link href="/" className="mb-4 inline-block text-sm text-ink-dim hover:text-ink">
          ← Назад
        </Link>
        <h1 className="mb-6 font-display text-xl font-bold">Новая ретроспектива</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink-dim">
            Название доски
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              placeholder="Спринт 24 — ретро"
              className="rounded-lg border border-line bg-bg-soft px-3 py-2 text-ink outline-none focus:border-amber"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-dim">
            Ваше имя (вы тоже участвуете как модератор)
            <input
              value={moderatorName}
              onChange={(e) => setModeratorName(e.target.value)}
              maxLength={60}
              placeholder="Например, Аня"
              className="rounded-lg border border-line bg-bg-soft px-3 py-2 text-ink outline-none focus:border-amber"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm text-ink-dim">
            <label htmlFor="votes-per-participant">Голосов на участника</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustVotes(-1)}
                className="h-9 w-9 rounded-lg border border-line bg-bg-soft text-ink hover:brightness-125"
              >
                −
              </button>
              <input
                id="votes-per-participant"
                type="text"
                inputMode="numeric"
                value={votesInput}
                onChange={(e) => setVotesInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                onBlur={() => setVotesInput(String(clampVotes(parseInt(votesInput, 10))))}
                className="w-16 rounded-lg border border-line bg-bg-soft px-3 py-2 text-center text-ink outline-none focus:border-amber"
              />
              <button
                type="button"
                onClick={() => adjustVotes(1)}
                className="h-9 w-9 rounded-lg border border-line bg-bg-soft text-ink hover:brightness-125"
              >
                +
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-amber px-4 py-3 text-sm font-semibold text-amber-ink hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Создаём...' : 'Создать'}
          </button>
        </form>
      </div>
    </main>
  );
}
