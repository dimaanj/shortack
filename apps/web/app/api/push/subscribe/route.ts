import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { savePushSubscription } from "@/lib/firestore";

function sessionUserId(session: { user?: { id?: string } } | null): string | null {
  const id = session?.user && "id" in session.user ? session.user.id : null;
  return typeof id === "string" ? id : null;
}

function parseSubscription(body: unknown): {
  userId: string | null;
  endpoint: string;
  keys: { p256dh: string; auth: string };
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const userId = typeof o.userId === "string" ? o.userId : null;
  const subscription = o.subscription && typeof o.subscription === "object" ? (o.subscription as Record<string, unknown>) : null;
  if (!subscription) return null;
  const endpoint = typeof subscription.endpoint === "string" ? subscription.endpoint : null;
  const keys = subscription.keys && typeof subscription.keys === "object" ? (subscription.keys as Record<string, unknown>) : null;
  const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : null;
  const auth = typeof keys?.auth === "string" ? keys.auth : null;
  if (!endpoint || !p256dh || !auth) return null;
  return { userId, endpoint, keys: { p256dh, auth } };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUserIdValue = sessionUserId(session as { user?: { id?: string } } | null);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseSubscription(body);
  if (!parsed) {
    return NextResponse.json(
      { error: "Missing or invalid subscription (endpoint, keys.p256dh, keys.auth)" },
      { status: 400 }
    );
  }
  const userId = sessionUserIdValue ?? parsed.userId;
  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId (session or body)" },
      { status: 400 }
    );
  }
  try {
    await savePushSubscription(userId, {
      endpoint: parsed.endpoint,
      keys: parsed.keys,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/push/subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
