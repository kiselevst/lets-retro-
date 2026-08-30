import { SettingsPageClient } from '@/components/SettingsPageClient';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <SettingsPageClient boardId={boardId} />;
}
