'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { findBoardIdByCode } from '@/lib/board';

export function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Введите код доски.');
      return;
    }
    setLoading(true);
    setError('');
    const boardId = await findBoardIdByCode(trimmed);
    setLoading(false);
    if (!boardId) {
      setError('Доска с таким кодом не найдена.');
      return;
    }
    router.push(`/r/${boardId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        placeholder="Код доски (запасной вариант)"
        className="w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm tracking-wider text-ink outline-none focus:border-amber"
      />
      {error && <p className="text-xs text-coral">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg border border-line bg-bg-soft px-4 py-2 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
      >
        {loading ? 'Ищем...' : 'Присоединиться по коду'}
      </button>
    </form>
  );
}
