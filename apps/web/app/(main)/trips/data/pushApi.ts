type PushSubscriptionPayload = {
  userId: string;
  subscription: {
    endpoint: string;
    keys?: {
      auth?: string;
      p256dh?: string;
      [key: string]: string | undefined;
    };
  };
};

export async function getVapidPublicKey(): Promise<string> {
  const res = await fetch("/api/push/vapid-public");
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "VAPID not configured");
  }

  if (!data.publicKey) {
    throw new Error("VAPID public key missing in response");
  }

  return data.publicKey as string;
}

export async function subscribePush(
  payload: PushSubscriptionPayload,
): Promise<void> {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Subscribe failed");
  }
}

