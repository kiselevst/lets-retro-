import { SettingsModalClient } from '@/components/SettingsModalClient';

export default async function InterceptedSettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <SettingsModalClient boardId={boardId} />;
}
