'use client';

import { useRouter } from 'next/navigation';
import { SettingsContent } from './SettingsContent';

export function SettingsModalClient({ boardId }: { boardId: string }) {
  const router = useRouter();

  function close() {
    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-card border border-line bg-panel shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsContent boardId={boardId} onClose={close} />
      </div>
    </div>
  );
}
