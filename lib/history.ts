export interface HistoryEntry {
  boardId: string;
  name: string;
  code: string;
  createdAt: string;
}

const HISTORY_KEY = 'lets-retro:my-boards';
const MAX_ENTRIES = 100;

export function getBoardHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addBoardToHistory(entry: HistoryEntry): void {
  if (typeof window === 'undefined') return;
  const current = getBoardHistory().filter((e) => e.boardId !== entry.boardId);
  const updated = [entry, ...current].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function removeBoardFromHistory(boardId: string): void {
  if (typeof window === 'undefined') return;
  const updated = getBoardHistory().filter((e) => e.boardId !== boardId);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}
