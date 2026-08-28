import Link from 'next/link';
import { JoinByCode } from '@/components/JoinByCode';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-panel p-9 shadow-panel">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-green"
            style={{ boxShadow: '14px 0 0 #F2C94C, 28px 0 0 #9B6BD9' }}
          />
        </div>
        <h1 className="mb-1 font-display text-2xl font-bold">Let&apos;s Retro</h1>
        <p className="mb-7 text-sm text-ink-dim">
          Ретроспектива команды: что получилось, что нет, что делаем дальше.
        </p>
        <Link
          href="/create"
          className="mb-4 block w-full rounded-lg bg-amber px-4 py-3 text-center text-sm font-semibold text-amber-ink hover:brightness-110"
        >
          Создать доску (я модератор)
        </Link>
        <div className="mb-4 h-px bg-line" />
        <JoinByCode />
      </div>
    </main>
  );
}
