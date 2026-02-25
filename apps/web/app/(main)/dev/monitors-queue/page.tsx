"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./monitors-queue.module.css";

type MonitorRecord = {
  id: string;
  userId: string;
  busProvider: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
  date: string;
  status: string;
  prevSlots: string[];
  createdAt: string;
};

type QueueInfo = {
  queueName: string;
  intervalMs: number;
  repeatableJobs: { id: string | null; key: string; name: string; next: number }[];
  jobCounts: { waiting: number; active: number; completed: number; failed: number };
};

export default function DevMonitorsQueuePage() {
  const [userId, setUserId] = useState("dev");
  const [monitors, setMonitors] = useState<MonitorRecord[] | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [monRes, queueRes] = await Promise.all([
        fetch(`/api/monitors?userId=${encodeURIComponent(userId)}`),
        fetch("/api/dev/queue"),
      ]);
      if (!monRes.ok) throw new Error(await monRes.text());
      if (!queueRes.ok) {
        if (queueRes.status === 404) setQueueInfo(null);
        else throw new Error(await queueRes.text());
      } else {
        const queueData = await queueRes.json();
        setQueueInfo(queueData);
      }
      const monData = await monRes.json();
      setMonitors(monData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
      setMonitors(null);
      setQueueInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [userId]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dev: Monitors &amp; Queue</h1>
        <p className={styles.subtitle}>
          Live view of Firestore monitors and BullMQ <code>monitor:poll</code> repeatable jobs (refreshes every 5s).
        </p>
        <Link href="/trips" className={styles.link}>
          ← Trips
        </Link>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Monitors (Firestore)</h2>
        <label className={styles.label}>
          User ID{" "}
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={styles.input}
          />
        </label>
        {loading && !monitors && <p className={styles.muted}>Loading…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {monitors && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>From → To</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Prev slots</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {monitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.muted}>
                      No monitors for this user
                    </td>
                  </tr>
                ) : (
                  monitors.map((m) => (
                    <tr key={m.id}>
                      <td className={styles.mono}>{m.id}</td>
                      <td>{m.from.name} → {m.to.name}</td>
                      <td>{m.date}</td>
                      <td>
                        <span className={m.status === "ACTIVE" ? styles.badgeActive : styles.badgeStopped}>
                          {m.status}
                        </span>
                      </td>
                      <td>{m.prevSlots?.length ?? 0}</td>
                      <td className={styles.small}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Queue: monitor:poll</h2>
        {queueInfo === undefined && !error && (
          <p className={styles.muted}>Loading queue…</p>
        )}
        {queueInfo === null && !error && (
          <p className={styles.muted}>Queue API not available (e.g. production or Redis down).</p>
        )}
        {queueInfo && (
          <>
            <p className={styles.meta}>
              Interval: <strong>{queueInfo.intervalMs / 1000}s</strong> per job ·{" "}
              Repeatable jobs: <strong>{queueInfo.repeatableJobs.length}</strong>
              {" "}
              · Waiting: {queueInfo.jobCounts.waiting} · Active: {queueInfo.jobCounts.active} ·
              Completed: {queueInfo.jobCounts.completed} · Failed: {queueInfo.jobCounts.failed}
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job id (monitorId)</th>
                    <th>Name</th>
                    <th>Next run</th>
                  </tr>
                </thead>
                <tbody>
                  {queueInfo.repeatableJobs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styles.muted}>
                        No repeatable jobs
                      </td>
                    </tr>
                  ) : (
                    queueInfo.repeatableJobs.map((j) => (
                      <tr key={j.key}>
                        <td className={styles.mono}>{j.id ?? "—"}</td>
                        <td>{j.name}</td>
                        <td className={styles.small}>
                          {j.next ? new Date(j.next).toLocaleTimeString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
