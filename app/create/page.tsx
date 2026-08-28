'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBoard } from '@/lib/board';
import { storeParticipant } from '@/lib/participant';

export default function CreateBoardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [moderatorName, setModeratorName] = useState('');
  const [votes, setVotes] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const boardName = name.trim() || 'Ретроспектива команды';
      const modName = moderatorName.trim() || 'Модератор';
      const { boardId, participantId } = await createBoard({
        boardName,
        moderatorName: modName,
        votesPerParticipant: votes,
      });
      storeParticipant(boardId, { participantId, name: modName, role: 'moderator' });
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
          <label className="flex flex-col gap-1 text-sm text-ink-dim">
            Голосов на участника
            <input
              type="number"
              min={1}
              max={20}
              value={votes}
              onChange={(e) => setVotes(parseInt(e.target.value, 10) || 5)}
              className="rounded-lg border border-line bg-bg-soft px-3 py-2 text-ink outline-none focus:border-amber"
            />
          </label>
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
