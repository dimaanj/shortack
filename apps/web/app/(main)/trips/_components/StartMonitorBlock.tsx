"use client";

import { useState } from "react";
import Link from "next/link";
import type { DestinationInfo } from "@shortack/monitor-core";
import { useCreateMonitor } from "../../entities/monitors";
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
  const [createdId, setCreatedId] = useState<string | null>(null);

  const createMonitorMutation = useCreateMonitor();

  const handleStart = async () => {
    setCreatedId(null);
    try {
      const result = await createMonitorMutation.mutateAsync({
        userId,
        from,
        to,
        date,
      });
      setCreatedId(result.id);
    } catch (e) {
      // Error is already captured in createMonitorMutation.error
      if (!(e instanceof Error)) {
        // no-op, we rely on mutation error message below
      }
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
        disabled={createMonitorMutation.isPending}
        className={styles.button}
      >
        {createMonitorMutation.isPending ? "Starting…" : "Start monitor"}
      </button>
      {createMonitorMutation.error && (
        <p className={styles.error}>
          {createMonitorMutation.error instanceof Error
            ? createMonitorMutation.error.message
            : "Failed to start monitor"}
        </p>
      )}
      {createdId && (
        <p className={styles.success}>
          Monitor started.{" "}
          <Link href="/monitors">View your monitors</Link>
        </p>
      )}
    </div>
  );
}
