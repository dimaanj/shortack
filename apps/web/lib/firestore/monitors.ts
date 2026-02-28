import type { MonitorRecord, MonitorData } from "@shortack/monitor-core";
import { getFirestoreClient, MONITORS_COLLECTION } from "./client";

const col = () => getFirestoreClient().collection(MONITORS_COLLECTION);

export async function createMonitor(
  id: string,
  data: MonitorData
): Promise<MonitorRecord> {
  const record: MonitorRecord = {
    ...data,
    id,
    status: "ACTIVE",
    prevSlots: [],
    createdAt: new Date().toISOString(),
  };
  await col().doc(id).set(record);
  return record;
}

export async function getMonitorById(id: string): Promise<MonitorRecord | null> {
  const snap = await col().doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as MonitorRecord;
}

export async function listMonitorsByUserId(
  userId: string
): Promise<MonitorRecord[]> {
  const snap = await col().where("userId", "==", userId).get();
  return snap.docs.map((d) => d.data() as MonitorRecord);
}

/** All ACTIVE monitors for the same route and date (for shared job / filterKey). */
export async function getActiveMonitorsByFilter(
  fromId: string,
  toId: string,
  date: string
): Promise<MonitorRecord[]> {
  const snap = await col()
    .where("from.id", "==", fromId)
    .where("to.id", "==", toId)
    .where("date", "==", date)
    .where("status", "==", "ACTIVE")
    .get();
  return snap.docs.map((d) => d.data() as MonitorRecord);
}

export async function updateMonitorPrevSlots(
  id: string,
  prevSlots: string[]
): Promise<void> {
  await col().doc(id).update({ prevSlots });
}

export async function updateMonitorStatus(
  id: string,
  status: "ACTIVE" | "STOPPED"
): Promise<void> {
  await col().doc(id).update({ status });
}
