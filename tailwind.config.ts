import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Нейтральная "хром"-палитра — через CSS-переменные (см.
        // app/globals.css), чтобы переключение темы не требовало трогать
        // ни один компонент. Акцентные/семантические цвета ниже (amber,
        // teal, цвета столбцов и т.д.) одинаковые в обеих темах — это
        // сознательный выбор пользователя для конкретного столбца/кнопки,
        // а не часть темы оформления.
        bg: 'var(--color-bg)',
        'bg-soft': 'var(--color-bg-soft)',
        'btn-add-bg': 'var(--color-btn-add-bg)',
        panel: 'var(--color-panel)',
        line: 'var(--color-line)',
        ink: 'var(--color-ink)',
        'ink-dim': 'var(--color-ink-dim)',
        amber: { DEFAULT: '#F4B942', ink: '#3A2E0A' },
        coral: { DEFAULT: '#EF6F6C', ink: '#3A1211' },
        teal: { DEFAULT: '#57C6B6', ink: '#0B2E29' },
        blue: '#4C8DE5',
        green: '#3FB56D',
        purple: '#9B6BD9',
        yellow: '#F2C94C',
        cyan: '#3FC1D6',
        orange: '#E8963D',
        brown: '#A17953',
        gray: '#8A9099',
      },
      fontFamily: {
        // У Space Grotesk нет кириллицы — для русского текста браузер сам
        // переключится на второй шрифт в списке (Inter).
        display: ['var(--font-display)', 'var(--font-body)', 'sans-serif'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
      },
    },
  },
  plugins: [],
};

export default config;
