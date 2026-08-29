import type { CardRow } from '@/lib/types';

interface CardProps {
  card: CardRow;
  authorName: string;
}

export function Card({ card, authorName }: CardProps) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3.5 shadow-panel">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{card.text}</p>
      <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-ink-dim">
        <span>{authorName}</span>
      </div>
    </div>
  );
}
