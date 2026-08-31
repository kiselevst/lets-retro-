'use client';

import { useEffect, useState } from 'react';
import { getStoredTheme, applyTheme, type Theme } from '@/lib/theme';

export function ThemeToggleFloating() {
  const [theme, setTheme] = useState<Theme>('dark');
  // Реальная тема (localStorage/устройство) известна только в браузере —
  // до монтирования компонента иконку не показываем, чтобы не мигнуть не
  // тем значком и не словить рассинхронизацию сервер/клиент на этом узле.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  function handleToggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={handleToggle}
      title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      aria-label="Переключить тему"
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-base shadow-panel hover:brightness-125"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
