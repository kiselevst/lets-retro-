'use client';

import { useEffect, useState } from 'react';
import { getStoredTheme, applyTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function handleToggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={handleToggle}
      className="flex w-full items-center justify-between rounded-lg border border-line bg-bg-soft px-4 py-2.5 text-sm text-ink hover:brightness-110"
    >
      <span>{theme === 'dark' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}</span>
      <span className="text-xs text-ink-dim">нажмите, чтобы сменить</span>
    </button>
  );
}
