import type { Config } from 'tailwindcss';

// Палитра 1:1 перенесена из CSS-переменных прототипа (retro-board.html),
// чтобы визуально ничего не "поплыло" при миграции.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1E2126',
        'bg-soft': '#262A31',
        'btn-add-bg': '#181A1F',
        panel: '#2C3038',
        line: '#3A3F48',
        ink: '#EDEFF2',
        'ink-dim': '#9AA1AC',
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
        // Fallback на Inter: у Space Grotesk нет кириллицы, для русского текста
        // браузер сам переключится на второй шрифт в списке.
        display: ['var(--font-display)', 'var(--font-body)', 'sans-serif'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
