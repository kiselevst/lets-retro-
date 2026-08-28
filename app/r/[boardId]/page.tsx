import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RoomClient } from '@/components/RoomClient';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  const { data: board, error } = await supabase
    .from('boards')
    .select('id, name, code')
    .eq('id', boardId)
    .maybeSingle();

  if (error || !board) {
    notFound();
  }

  return <RoomClient board={board} />;
}
