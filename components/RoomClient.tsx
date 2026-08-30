'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { getStoredParticipant, storeParticipant, type StoredParticipant } from '@/lib/participant';
import { joinBoardAsParticipant } from '@/lib/board';
import { Board } from './Board';

interface RoomClientProps {
  board: { id: string; name: string; code: string };
}

export function RoomClient({ board }: RoomClientProps) {
  // undefined = ещё не проверили localStorage, null = проверили, участника нет.
  // Это разграничение нужно, чтобы на долю секунды не мигнуть формой входа
  // тому, кто уже был на доске.
  const [participant, setParticipant] = useState<StoredParticipant | null | undefined>(undefined);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setParticipant(getStoredParticipant(board.id));
  }, [board.id]);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Введите имя.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const participantId = await joinBoardAsParticipant(board.id, trimmed);
      const stored: StoredParticipant = { participantId, name: trimmed, role: 'participant' };
      storeParticipant(board.id, stored);
      setParticipant(stored);
    } catch (err) {
      console.error(err);
      setError('Не удалось присоединиться. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  if (participant === undefined) {
    return null;
  }

  if (!participant) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-card border border-line bg-panel p-9 shadow-panel">
          <h1 className="mb-1 font-display text-xl font-bold">{board.name}</h1>
          <p className="mb-6 text-sm text-ink-dim">Введите имя, чтобы присоединиться к ретро.</p>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Ваше имя"
              autoFocus
              className="rounded-lg border border-line bg-bg-soft px-3 py-2 text-ink outline-none focus:border-amber"
            />
            {error && <p className="text-xs text-coral">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-amber px-4 py-3 text-sm font-semibold text-amber-ink hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Входим...' : 'Войти на доску'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-soft px-6 py-3.5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-bold">{board.name}</h1>
          <span className="rounded-lg border border-line bg-panel px-2.5 py-1 font-mono text-xs text-amber">
            {board.code}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-dim">
            {participant.name}
            {participant.role === 'moderator' ? ' · модератор' : ''}
          </span>
          {participant.role === 'moderator' && (
            <Link
              href={`/r/${board.id}/settings`}
              className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink hover:brightness-125"
            >
              ⚙ Настройки
            </Link>
          )}
        </div>
      </header>
      <Board boardId={board.id} participant={participant} />
    </div>
  );
}
