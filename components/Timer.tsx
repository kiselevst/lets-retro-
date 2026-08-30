'use client';

import { useEffect, useState } from 'react';
import type { TimerStateRow } from '@/lib/types';

interface TimerProps {
  timer: TimerStateRow | null;
  isModerator: boolean;
  onStart: (minutes: number) => void;
  onStop: () => void;
}

export function Timer({ timer, isModerator, onStart, onStop }: TimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [pendingMinutes, setPendingMinutes] = useState(5);

  const endsAt = timer?.ends_at ? new Date(timer.ends_at).getTime() : null;
  const totalSeconds = timer?.total_seconds ?? null;
  const running = endsAt !== null;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (!running && !isModerator) return null;

  let remainingSec = 0;
  let expired = false;
  if (running && endsAt !== null) {
    remainingSec = Math.max(0, Math.ceil((endsAt - now) / 1000));
    expired = remainingSec <= 0;
  }
  const minutesLeft = Math.floor(remainingSec / 60);
  const secondsLeft = remainingSec % 60;
  const warn = running && remainingSec <= 30 && !expired;
  const fraction = totalSeconds ? Math.max(0, Math.min(1, remainingSec / totalSeconds)) : 0;

  function adjust(delta: number) {
    setPendingMinutes((m) => Math.min(90, Math.max(1, m + delta)));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {running && (
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-semibold ${warn ? 'text-coral' : 'text-ink'}`}>
            {expired ? 'Время вышло' : `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`}
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full transition-[width] duration-1000 ${warn ? 'bg-coral' : 'bg-teal'}`}
              style={{ width: `${fraction * 100}%` }}
            />
          </div>
        </div>
      )}

      {isModerator &&
        (running ? (
          <button
            onClick={onStop}
            className="rounded-lg bg-coral px-3 py-1.5 text-xs font-semibold text-coral-ink hover:brightness-110"
          >
            ⏹ Стоп
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-lg border border-line bg-panel">
              <button
                type="button"
                onClick={() => adjust(-1)}
                className="h-8 w-8 text-ink hover:bg-bg-soft"
              >
                −
              </button>
              <span className="w-14 text-center font-mono text-sm">{pendingMinutes} мин</span>
              <button
                type="button"
                onClick={() => adjust(1)}
                className="h-8 w-8 text-ink hover:bg-bg-soft"
              >
                +
              </button>
            </div>
            <button
              onClick={() => onStart(pendingMinutes)}
              className="rounded-lg bg-amber px-3 py-1.5 text-xs font-semibold text-amber-ink hover:brightness-110"
            >
              ▶ Старт
            </button>
          </div>
        ))}
    </div>
  );
}
