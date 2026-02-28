import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { MonitorRecord } from "@shortack/monitor-core";

const MONITORS_COLLECTION = "monitors";
const PUSH_SUBSCRIPTIONS_COLLECTION = "push_subscriptions";

export type PushSubscriptionRecord = {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
};

function getDb() {
  const apps = getApps();
  if (apps.length > 0) return getFirestore(apps[0]);
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!projectId && !creds) {
    throw new Error(
      "Set FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS"
    );
  }
  initializeApp(projectId ? { projectId } : {});
  return getFirestore();
}

export async function getMonitorById(
  id: string
): Promise<MonitorRecord | null> {
  const snap = await getDb().collection(MONITORS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as MonitorRecord;
}

export async function updateMonitorPrevSlots(
  id: string,
  prevSlots: string[]
): Promise<void> {
  await getDb()
    .collection(MONITORS_COLLECTION)
    .doc(id)
    .update({ prevSlots });
}

/** All ACTIVE monitors for the same route and date (one job serves all). */
export async function getActiveMonitorsByFilter(
  fromId: string,
  toId: string,
  date: string
): Promise<MonitorRecord[]> {
  const snap = await getDb()
    .collection(MONITORS_COLLECTION)
    .where("from.id", "==", fromId)
    .where("to.id", "==", toId)
    .where("date", "==", date)
    .where("status", "==", "ACTIVE")
    .get();
  return snap.docs.map((d) => d.data() as MonitorRecord);
}

export async function getPushSubscriptionsByUserId(
  userId: string
): Promise<PushSubscriptionRecord[]> {
  const snap = await getDb()
    .collection(PUSH_SUBSCRIPTIONS_COLLECTION)
    .where("userId", "==", userId)
    .get();
  return snap.docs.map((d) => d.data() as PushSubscriptionRecord);
}
