import { supabase } from './supabase';
import type { ColumnRow, CardRow } from './types';

export interface ExportedColumn {
  key: string;
  title: string;
  description: string;
  color: string;
  style: string;
}

export interface ExportedCardSource {
  text: string;
  author: string;
}

export interface ExportedCard {
  id: string;
  column: string;
  text: string;
  author: string;
  votes: number;
  done: boolean;
  sources: ExportedCardSource[];
  smartSuccess: string | null;
  smartOwner: string | null;
  smartDeadline: string | null;
  createdAt: string;
}

export interface ExportedBoard {
  name: string;
  createdAt: string;
  votesPerParticipant: number;
  columns: ExportedColumn[];
}

export interface ExportPayload {
  exportedAt: string;
  board: ExportedBoard;
  cards: ExportedCard[];
}

/**
 * Снимок доски по столбцам-ключам (well/notwell/actions), а не по
 * внутренним id — эти id имеют смысл только внутри одной конкретной базы.
 */
export async function buildExportPayload(boardId: string): Promise<ExportPayload> {
  const [
    { data: board },
    { data: boardSettings },
    { data: columns },
    { data: cards },
    { data: participants },
    { data: votes },
  ] = await Promise.all([
    supabase.from('boards').select('*').eq('id', boardId).single(),
    supabase.from('board_settings').select('*').eq('board_id', boardId).maybeSingle(),
    supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
    supabase.from('cards').select('*').eq('board_id', boardId).order('position'),
    supabase.from('participants').select('*').eq('board_id', boardId),
    supabase.from('votes').select('*').eq('board_id', boardId),
  ]);

  if (!board) throw new Error('Доска не найдена');

  const columnRows = (columns ?? []) as ColumnRow[];
  const cardRows = (cards ?? []) as CardRow[];
  const columnById = new Map(columnRows.map((c) => [c.id, c]));
  const participantNameById = new Map(
    ((participants ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]),
  );
  const voteCountByCard = new Map<string, number>();
  ((votes ?? []) as { card_id: string }[]).forEach((v) => {
    voteCountByCard.set(v.card_id, (voteCountByCard.get(v.card_id) ?? 0) + 1);
  });

  const exportedColumns: ExportedColumn[] = columnRows.map((c) => ({
    key: c.key,
    title: c.title,
    description: c.description,
    color: c.color,
    style: c.style,
  }));

  const exportedCards: ExportedCard[] = cardRows.map((card) => {
    const column = columnById.get(card.column_id);
    return {
      id: card.id,
      column: column ? column.key : 'well',
      text: card.text,
      author: card.author_participant_id
        ? (participantNameById.get(card.author_participant_id) ?? 'Аноним')
        : 'Аноним',
      votes: voteCountByCard.get(card.id) ?? 0,
      done: card.done,
      sources: card.sources,
      smartSuccess: card.smart_success,
      smartOwner: card.smart_owner,
      smartDeadline: card.smart_deadline,
      createdAt: card.created_at,
    };
  });

  return {
    exportedAt: new Date().toISOString(),
    board: {
      name: board.name,
      createdAt: board.created_at,
      votesPerParticipant: boardSettings?.votes_per_participant ?? 5,
      columns: exportedColumns,
    },
    cards: exportedCards,
  };
}

export function downloadExportFile(payload: ExportPayload): void {
  const jsonText = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName =
    (payload.board.name || 'retro').replace(/[^a-zA-Zа-яА-Я0-9 _-]/g, '').trim() || 'retro';
  a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
