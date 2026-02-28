"use client";

import { useState } from "react";
import Link from "next/link";
import { useDevMonitors, useQueueInfo } from "./domain/monitorsQueue";
import type { MonitorRecord, QueueInfo } from "./data/queueApi";
import styles from "./monitors-queue.module.css";

export default function DevMonitorsQueuePage() {
  const [userId, setUserId] = useState("dev");

  const {
    monitors,
    isLoading: monitorsLoading,
    error: monitorsError,
  } = useDevMonitors(userId);

  const {
    queueInfo,
    isLoading: queueLoading,
    error: queueError,
  } = useQueueInfo();

  const error = monitorsError ?? queueError;

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
        {monitorsLoading && monitors.length === 0 && (
          <p className={styles.muted}>Loading…</p>
        )}
        {error && <p className={styles.error}>{error.message}</p>}
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
                  monitors.map((m: MonitorRecord) => (
                    <tr key={m.id}>
                      <td className={styles.mono}>{m.id}</td>
                      <td>
                        {m.from.name} → {m.to.name}
                      </td>
                      <td>{m.date}</td>
                      <td>
                        <span
                          className={
                            m.status === "ACTIVE"
                              ? styles.badgeActive
                              : styles.badgeStopped
                          }
                        >
                          {m.status}
                        </span>
                      </td>
                      <td>{m.prevSlots?.length ?? 0}</td>
                      <td className={styles.small}>
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString()
                          : "—"}
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
        {queueLoading && !queueInfo && !error && (
          <p className={styles.muted}>Loading queue…</p>
        )}
        {queueInfo === null && !error && !queueLoading && (
          <p className={styles.muted}>
            Queue API not available (e.g. production or Redis down).
          </p>
        )}
        {queueInfo && (
          <>
            <p className={styles.meta}>
              Interval: <strong>{queueInfo.intervalMs / 1000}s</strong> per job ·{" "}
              Repeatable jobs: <strong>{queueInfo.repeatableJobs.length}</strong> ·
              Waiting: {queueInfo.jobCounts.waiting} · Active:{" "}
              {queueInfo.jobCounts.active} · Completed:{" "}
              {queueInfo.jobCounts.completed} · Failed:{" "}
              {queueInfo.jobCounts.failed}
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job id (filterKey)</th>
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
                    queueInfo.repeatableJobs.map((j: QueueInfo["repeatableJobs"][number]) => (
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
