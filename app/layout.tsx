import type { Metadata } from 'next';
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';
import { ThemeToggleFloating } from '@/components/ThemeToggleFloating';
import './globals.css';

// У Space Grotesk на Google Fonts нет кириллических глифов (только latin/latin-ext/vietnamese).
// Русский текст в заголовках будет автоматически падать на Inter — см. font-display в tailwind.config.ts.
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Let's Retro",
  description: 'Ретроспектива команды: что получилось, что нет, что делаем дальше.',
};

// Синхронный блокирующий скрипт до отрисовки: без него при выбранной светлой
// теме (или светлой теме устройства) на долю секунды мелькала бы тёмная —
// сервер всегда рендерит дефолтные значения из :root, ни localStorage, ни
// prefers-color-scheme ему не видны. Логика продублирована в lib/theme.ts —
// сюда её напрямую не импортировать, скрипт исполняется раньше любого бандла.
const themeInitScript = `
try {
  var t = localStorage.getItem('lets-retro:theme');
  if (t !== 'light' && t !== 'dark') {
    t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning — атрибут data-theme на этом узле выставляет
    // скрипт выше ДО того, как React успевает сравнить дерево с серверным
    // рендером; без этого флага React считает такое расхождение ошибкой
    // гидратации (хотя оно ожидаемо и безопасно — обычная практика для
    // переключателей темы).
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
        {children}
        <ThemeToggleFloating />
      </body>
    </html>
  );
}
