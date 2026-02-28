"use client";

import { useState, useEffect } from "react";
import { getVapidPublicKey } from "../data/pushApi";
import { usePushSubscribe } from "../domain/push";
import styles from "./PushSubscribe.module.css";

type Status = "idle" | "loading" | "subscribed" | "unsupported" | "error";

export function PushSubscribe({ defaultUserId = "dev" }: { defaultUserId?: string }) {
  const [userId, setUserId] = useState(defaultUserId);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const pushSubscribeMutation = usePushSubscribe();

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
      const publicKey = await getVapidPublicKey();
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        if (permission === "denied") {
          setMessage(
            "Notifications blocked. Enable them in your browser settings for this site and try again."
          );
        } else {
          setMessage(
            "Permission not granted. Please allow notifications when the browser prompts you."
          );
        }
        setStatus("idle");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // The PushManager API expects an ArrayBuffer; browsers accept Uint8Array.buffer.
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const subJson = sub.toJSON();
      console.log('subJson', subJson);
      await pushSubscribeMutation.mutateAsync({
        userId,
        subscription: {
          endpoint: subJson.endpoint,
          keys: subJson.keys ?? undefined,
        },
      });
      setStatus("subscribed");
      setMessage("You'll get notified when seats become available.");
    } catch (e) {
      setStatus("error");
      const mutationError = pushSubscribeMutation.error;
      if (mutationError instanceof Error) {
        setMessage(mutationError.message);
      } else {
        setMessage(e instanceof Error ? e.message : "Something went wrong");
      }
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

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output.buffer;
}
