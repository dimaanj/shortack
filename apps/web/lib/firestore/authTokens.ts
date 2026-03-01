import { getFirestoreClient } from "./client";
import { createHash } from "crypto";

const COLLECTION = "auth_tokens";
const EMAIL_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function emailUserId(email: string): string {
  const normalized = email.trim().toLowerCase();
  const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  return `email_${hash}`;
}

export async function createEmailToken(email: string): Promise<{ token: string; userId: string }> {
  const db = getFirestoreClient();
  const userId = emailUserId(email);
  const token = createHash("sha256")
    .update(`${email}:${userId}:${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 32);
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS);
  await db.collection(COLLECTION).doc(token).set({
    email: email.trim().toLowerCase(),
    userId,
    expiresAt: expiresAt.toISOString(),
  });
  return { token, userId };
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const db = getFirestoreClient();
  const doc = await db.collection(COLLECTION).doc(token).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data) return null;
  const expiresAt = new Date(data.expiresAt as string).getTime();
  if (Date.now() > expiresAt) {
    await doc.ref.delete();
    return null;
  }
  const userId = data.userId as string;
  await doc.ref.delete();
  return userId;
}

export { emailUserId };
