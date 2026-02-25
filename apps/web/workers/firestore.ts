import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { MonitorRecord } from "@shortack/monitor-core";

const MONITORS_COLLECTION = "monitors";

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
