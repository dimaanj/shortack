import type { DestinationInfo, MonitorRecord } from "@shortack/monitor-core";

export type CreateMonitorInput = {
  userId: string;
  from: DestinationInfo;
  to: DestinationInfo;
  date: string;
};

export type CreateMonitorResponse = {
  id: string;
};

export async function createMonitor(
  input: CreateMonitorInput,
): Promise<CreateMonitorResponse> {
  const res = await fetch("/api/monitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      from: { id: input.from.id, name: input.from.name },
      to: { id: input.to.id, name: input.to.name },
      date: input.date,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  if (!data.id) {
    throw new Error("Missing monitor id in response");
  }

  return { id: data.id };
}

export async function getMonitors(userId: string): Promise<MonitorRecord[]> {
  const trimmed = userId.trim();
  if (!trimmed) return [];

  const res = await fetch(`/api/monitors?userId=${encodeURIComponent(trimmed)}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return Array.isArray(data) ? (data as MonitorRecord[]) : [];
}

export async function stopMonitor(id: string): Promise<void> {
  const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
}
