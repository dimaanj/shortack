"use client";

import { useState } from "react";
import Link from "next/link";
import type { MonitorRecord } from "@shortack/monitor-core";
import { useMonitors, useStopMonitor } from "../entities/monitors";
import styles from "./monitors.module.css";

export function MonitorsPageContainer() {
  const [userId, setUserId] = useState("dev");
  const [stoppingId, setStoppingId] = useState<string | null>(null);

  const { monitors, isLoading, error, refetch } = useMonitors(userId);
  const stopMonitorMutation = useStopMonitor(userId);

  const handleStop = async (id: string) => {
    setStoppingId(id);
    try {
      await stopMonitorMutation.mutateAsync(id);
    } finally {
      setStoppingId(null);
    }
  };

  const hasUserId = !!userId.trim();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My monitors</h1>
      <p className={styles.subtitle}>
        View and stop monitors. Create one from the{" "}
        <Link href="/trips">Trips</Link> page by selecting a route and date.
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
        onClick={() => refetch()}
        disabled={isLoading}
        className={styles.refreshButton}
      >
        {isLoading ? "Loading…" : "Refresh"}
      </button>
      {error && <p className={styles.error}>{error.message}</p>}
      {!isLoading && monitors.length === 0 && hasUserId && !error && (
        <p className={styles.empty}>No monitors for this user.</p>
      )}
      {monitors.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Status</th>
                <th>Slots seen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {monitors.map((m: MonitorRecord) => (
                <tr key={m.id}>
                  <td>{m.from.name}</td>
                  <td>{m.to.name}</td>
                  <td>
                    {new Date(m.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={
                        m.status === "ACTIVE"
                          ? styles.statusActive
                          : styles.statusStopped
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>{m.prevSlots?.length ?? 0}</td>
                  <td>
                    {m.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleStop(m.id)}
                        disabled={stoppingId === m.id}
                        className={styles.stopButton}
                      >
                        {stoppingId === m.id ? "Stopping…" : "Stop"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
