import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestore: Firestore | null = null;

function getApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!projectId && !credentials) {
    throw new Error(
      "Firestore: set FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS"
    );
  }
  return initializeApp(projectId ? { projectId } : {});
}

export function getFirestoreClient(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getApp());
  }
  return firestore;
}

export const MONITORS_COLLECTION = "monitors";
export const PUSH_SUBSCRIPTIONS_COLLECTION = "push_subscriptions";
