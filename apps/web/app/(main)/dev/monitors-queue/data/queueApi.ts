export type MonitorRecord = {
  id: string;
  userId: string;
  busProvider: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
  date: string;
  status: string;
  prevSlots: string[];
  createdAt: string;
};

export type QueueInfo = {
  queueName: string;
  intervalMs: number;
  repeatableJobs: { id: string | null; key: string; name: string; next: number }[];
  jobCounts: { waiting: number; active: number; completed: number; failed: number };
};

export async function getDevMonitors(userId: string): Promise<MonitorRecord[]> {
  const res = await fetch(`/api/monitors?userId=${encodeURIComponent(userId)}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Failed to fetch monitors");
  }

  return Array.isArray(data) ? (data as MonitorRecord[]) : [];
}

export async function getQueueInfo(): Promise<QueueInfo | null> {
  const res = await fetch("/api/dev/queue");

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = (await res.json().catch(() => ({}))) as QueueInfo;
  return data;
}

