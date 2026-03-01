import { MonitorDetailContainer } from "../_components/MonitorDetailContainer";

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MonitorDetailContainer monitorId={id} />;
}
