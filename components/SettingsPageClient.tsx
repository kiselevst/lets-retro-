'use client';

import { useRouter } from 'next/navigation';
import { SettingsContent } from './SettingsContent';

export function SettingsPageClient({ boardId }: { boardId: string }) {
  const router = useRouter();

  function close() {
    router.push(`/r/${boardId}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-lg rounded-card border border-line bg-panel shadow-panel">
        <SettingsContent boardId={boardId} onClose={close} />
      </div>
    </main>
  );
}
