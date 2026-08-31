'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getBoardHistory, removeBoardFromHistory, type HistoryEntry } from '@/lib/history';

interface LiveInfo {
  exists: boolean;
  completed: boolean;
  cardCount: number;
}

export function HistoryClient() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [liveInfo, setLiveInfo] = useState<Record<string, LiveInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getBoardHistory();
    setEntries(stored);

    async function loadLiveInfo() {
      const results: Record<string, LiveInfo> = {};
      await Promise.all(
        stored.map(async (entry) => {
          const [{ data: board }, { data: settings }, { count }] = await Promise.all([
            supabase.from('boards').select('id').eq('id', entry.boardId).maybeSingle(),
            supabase
              .from('board_settings')
              .select('completed')
              .eq('board_id', entry.boardId)
              .maybeSingle(),
            supabase
              .from('cards')
              .select('id', { count: 'exact', head: true })
              .eq('board_id', entry.boardId),
          ]);
          results[entry.boardId] = {
            exists: Boolean(board),
            completed: settings?.completed ?? false,
            cardCount: count ?? 0,
          };
        }),
      );
      setLiveInfo(results);
      setLoading(false);
    }

    if (stored.length > 0) {
      loadLiveInfo();
    } else {
      setLoading(false);
    }
  }, []);

  function handleRemove(boardId: string) {
    removeBoardFromHistory(boardId);
    setEntries((prev) => prev.filter((e) => e.boardId !== boardId));
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-card border border-line bg-panel p-9 shadow-panel">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-block text-sm text-ink-dim hover:text-ink"
        >
          ← Назад
        </button>
        <h1 className="mb-1 font-display text-xl font-bold">Мои доски</h1>
        <p className="mb-6 text-sm text-ink-dim">
          Список хранится в этом браузере — доски, которые вы создавали как модератор.
        </p>

        {entries.length === 0 ? (
          <p className="text-sm text-ink-dim">
            Пока пусто. Доски появятся здесь автоматически, когда создадите новую.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const info = liveInfo[entry.boardId];
              return (
                <div
                  key={entry.boardId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-soft px-3 py-2.5"
                >
                  <Link href={`/r/${entry.boardId}`} className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{entry.name}</div>
                    <div className="text-xs text-ink-dim">
                      {new Date(entry.createdAt).toLocaleDateString()} · код {entry.code}
                      {!loading && info && (
                        <>
                          {' · '}
                          {info.exists
                            ? `${info.cardCount} карточек${info.completed ? ' · завершена' : ''}`
                            : 'доска удалена'}
                        </>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(entry.boardId)}
                    title="Убрать из списка (саму доску это не удаляет)"
                    className="text-ink-dim hover:text-coral"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
