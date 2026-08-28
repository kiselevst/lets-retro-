import type { ParticipantRole } from './types';

export interface StoredParticipant {
  participantId: string;
  name: string;
  role: ParticipantRole;
}

function storageKey(boardId: string): string {
  return `lets-retro:participant:${boardId}`;
}

// На сервере (Server Components) window недоступен — во всех местах, где это
// вызывается из клиентского кода, boardId уже известен, поэтому просто
// возвращаем null при SSR, а не бросаем ошибку.
export function getStoredParticipant(boardId: string): StoredParticipant | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(boardId));
    return raw ? (JSON.parse(raw) as StoredParticipant) : null;
  } catch {
    return null;
  }
}

export function storeParticipant(boardId: string, participant: StoredParticipant): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(boardId), JSON.stringify(participant));
}
