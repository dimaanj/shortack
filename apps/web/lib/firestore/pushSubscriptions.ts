import { getFirestoreClient, PUSH_SUBSCRIPTIONS_COLLECTION } from "./client";

export type PushSubscriptionRecord = {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
};

const col = () =>
  getFirestoreClient().collection(PUSH_SUBSCRIPTIONS_COLLECTION);

/** Store a push subscription for a user (upsert by endpoint). */
export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<void> {
  const id = subscription.endpoint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 100);
  const record: PushSubscriptionRecord = {
    userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    createdAt: new Date().toISOString(),
  };
  await col().doc(id).set(record, { merge: true });
}

export async function getPushSubscriptionsByUserId(
  userId: string
): Promise<PushSubscriptionRecord[]> {
  const snap = await col().where("userId", "==", userId).get();
  return snap.docs.map((d) => d.data() as PushSubscriptionRecord);
}
