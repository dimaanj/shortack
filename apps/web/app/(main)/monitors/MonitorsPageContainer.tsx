"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MonitorRecord } from "@shortack/monitor-core";
import styles from "./monitors.module.css";

export function MonitorsPageContainer() {
  const [userId, setUserId] = useState("dev");
  const [monitors, setMonitors] = useState<MonitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stoppingId, setStoppingId] = useState<string | null>(null);

  const fetchMonitors = useCallback(async () => {
    if (!userId.trim()) {
      setMonitors([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/monitors?userId=${encodeURIComponent(userId.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
      setMonitors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitors");
      setMonitors([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  const handleStop = async (id: string) => {
    setStoppingId(id);
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to stop monitor");
    } finally {
      setStoppingId(null);
    }
  };

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
        onClick={fetchMonitors}
        disabled={loading}
        className={styles.refreshButton}
      >
        {loading ? "Loading…" : "Refresh"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {!loading && monitors.length === 0 && userId.trim() && !error && (
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
              {monitors.map((m) => (
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
