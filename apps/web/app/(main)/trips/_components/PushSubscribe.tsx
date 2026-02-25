"use client";

import { useState, useEffect } from "react";
import styles from "./PushSubscribe.module.css";

type Status = "idle" | "loading" | "subscribed" | "unsupported" | "error";

export function PushSubscribe({ defaultUserId = "dev" }: { defaultUserId?: string }) {
  const [userId, setUserId] = useState(defaultUserId);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
    }
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await (reg as unknown as { ready: Promise<ServiceWorkerRegistration> }).ready;
      const vapidRes = await fetch("/api/push/vapid-public");
      if (!vapidRes.ok) {
        const data = await vapidRes.json().catch(() => ({}));
        throw new Error(data.error || "VAPID not configured");
      }
      const { publicKey } = await vapidRes.json();
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permission denied");
        setStatus("idle");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const subJson = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subscription: {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscribe failed");
      }
      setStatus("subscribed");
      setMessage("You'll get notified when seats become available.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Push notifications</h2>
      <p className={styles.text}>
        Get notified when new seats appear for your monitored routes. Use the same user ID as when creating a monitor.
      </p>
      <label className={styles.label}>
        User ID{" "}
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={styles.input}
          placeholder="e.g. dev"
        />
      </label>
      {status === "unsupported" && (
        <p className={styles.muted}>Push not supported in this browser.</p>
      )}
      {status !== "unsupported" && (
        <>
          <button
            type="button"
            onClick={subscribe}
            disabled={status === "loading"}
            className={styles.button}
          >
            {status === "loading" ? "Subscribing…" : "Enable notifications"}
          </button>
          {message && (
            <p className={status === "error" ? styles.error : styles.muted}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}
