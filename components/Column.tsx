import type { ColumnRow, CardRow } from '@/lib/types';
import { Card } from './Card';

const COLOR_HEX: Record<string, string> = {
  green: '#3FB56D',
  red: '#E5534B',
  purple: '#9B6BD9',
  blue: '#4C8DE5',
  cyan: '#3FC1D6',
  orange: '#E8963D',
  brown: '#A17953',
  gray: '#8A9099',
};

interface ColumnProps {
  column: ColumnRow;
  cards: CardRow[];
  participantNameById: Map<string, string>;
}

export function Column({ column, cards, participantNameById }: ColumnProps) {
  const hex = COLOR_HEX[column.color] ?? COLOR_HEX.gray;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl px-4 py-3 font-display text-sm font-bold"
        style={{ backgroundColor: `${hex}26`, color: hex }}
      >
        {column.title}
      </div>
      {column.description && <p className="px-1 text-xs text-ink-dim">{column.description}</p>}
      <div className="flex flex-col gap-3">
        {cards.length === 0 && <p className="px-1 text-sm text-ink-dim">Пока пусто.</p>}
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            authorName={
              card.author_participant_id
                ? (participantNameById.get(card.author_participant_id) ?? '—')
                : '—'
            }
          />
        ))}
      </div>
    </div>
  );
}
