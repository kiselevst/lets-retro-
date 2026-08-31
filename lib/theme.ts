export type Theme = 'dark' | 'light';

const THEME_KEY = 'lets-retro:theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Приоритет: явный выбор пользователя (localStorage) > тема устройства
 * (prefers-color-scheme) > тёмная тема как последний резерв. Логика
 * продублирована в блокирующем скрипте app/layout.tsx — туда её нельзя
 * импортировать напрямую (скрипт исполняется до загрузки JS-бандла), так
 * что при изменении этой функции нужно поправить и скрипт тоже.
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage недоступен — просто идём дальше к теме устройства
  }
  return getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // тема просто не переживёт перезагрузку, не критично
  }
}
