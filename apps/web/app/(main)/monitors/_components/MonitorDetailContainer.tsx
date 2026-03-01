"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMonitor, useStopMonitor } from "../../entities/monitors";
import { buildScheduleUrl } from "@/lib/marshrutochka-url";
import styles from "../monitors.module.css";

export function MonitorDetailContainer({ monitorId }: { monitorId: string }) {
  const router = useRouter();
  const { monitor, isLoading, error, isNotFound } = useMonitor(monitorId);
  const stopMonitorMutation = useStopMonitor(monitor?.userId ?? "");

  const handleStop = async () => {
    if (!monitor) return;
    try {
      await stopMonitorMutation.mutateAsync(monitor.id);
      router.push("/monitors");
    } catch {
      // Error already shown by mutation
    }
  };

  if (isLoading) {
    return (
      <div className={styles.detailPage}>
        <p className={styles.detailMeta}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detailPage}>
        <Link href="/monitors" className={styles.backLink}>
          ← Back to monitors
        </Link>
        <p className={styles.error}>{error.message}</p>
      </div>
    );
  }

  if (isNotFound || !monitor) {
    return (
      <div className={styles.detailPage}>
        <Link href="/monitors" className={styles.backLink}>
          ← Back to monitors
        </Link>
        <p className={styles.empty}>Monitor not found.</p>
      </div>
    );
  }

  const scheduleUrl = buildScheduleUrl({
    fromId: monitor.from.id,
    toId: monitor.to.id,
    date: monitor.date,
  });
  const hasSlots = (monitor.prevSlots?.length ?? 0) > 0;

  return (
    <div className={styles.detailPage}>
      <Link href="/monitors" className={styles.backLink}>
        ← Back to monitors
      </Link>
      <h1 className={styles.detailTitle}>
        {monitor.from.name} → {monitor.to.name}
      </h1>
      <p className={styles.detailMeta}>
        {new Date(monitor.date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}{" "}
        ·{" "}
        <span
          className={
            monitor.status === "ACTIVE"
              ? styles.statusActive
              : styles.statusStopped
          }
        >
          {monitor.status}
        </span>
      </p>
      {hasSlots && (
        <p className={styles.slotsList}>
          Slots: {monitor.prevSlots!.join(", ")}
        </p>
      )}
      <div className={styles.bookingBlock}>
        <p className={styles.bookingBlockTitle}>
          Места есть. Забронировать на сайте Маршруточки.
        </p>
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bookingLink}
        >
          Перейти к бронированию на Маршруточке
        </a>
      </div>
      {monitor.status === "ACTIVE" && (
        <button
          type="button"
          onClick={handleStop}
          disabled={stopMonitorMutation.isPending}
          className={styles.stopButton}
          style={{ marginTop: "1rem" }}
        >
          {stopMonitorMutation.isPending ? "Stopping…" : "Stop monitor"}
        </button>
      )}
    </div>
  );
}
