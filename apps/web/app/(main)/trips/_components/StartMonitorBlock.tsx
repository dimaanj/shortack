"use client";

import { useState } from "react";
import Link from "next/link";
import type { DestinationInfo } from "@shortack/monitor-core";
import styles from "./StartMonitorBlock.module.css";

type StartMonitorBlockProps = {
  from: DestinationInfo;
  to: DestinationInfo;
  date: string;
  defaultUserId?: string;
};

export function StartMonitorBlock({
  from,
  to,
  date,
  defaultUserId = "dev",
}: StartMonitorBlockProps) {
  const [userId, setUserId] = useState(defaultUserId);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setCreatedId(null);
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          from: { id: from.id, name: from.name },
          to: { id: to.id, name: to.name },
          date,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
      setCreatedId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start monitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Notify when seats appear</h2>
      <p className={styles.text}>
        Start a monitor to get notified (including push) when new departure slots become available for this route and date.
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
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "Starting…" : "Start monitor"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {createdId && (
        <p className={styles.success}>
          Monitor started.{" "}
          <Link href="/monitors">View your monitors</Link>
        </p>
      )}
    </div>
  );
}
