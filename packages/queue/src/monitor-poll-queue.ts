import { Queue } from "bullmq";
import { getConnection } from "./connection.js";
import {
  MONITOR_POLL_QUEUE_NAME,
  MONITOR_POLL_INTERVAL_MS,
} from "./constants.js";
import type { MonitorPollJobData } from "./types.js";

let queue: Queue<MonitorPollJobData> | null = null;

export function getMonitorPollQueue(): Queue<MonitorPollJobData> {
  if (!queue) {
    queue = new Queue<MonitorPollJobData>(MONITOR_POLL_QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      },
    });
  }
  return queue;
}

/**
 * Add or update a repeatable poll job for a filter set (every 20s).
 * Uses BullMQ Job Scheduler API (getRepeatableJobs/removeRepeatableByKey are deprecated in v6).
 * Multiple users with same from/to/date share one scheduler; upsert avoids duplicates.
 */
export async function addMonitorPollJob(filterKey: string): Promise<void> {
  const q = getMonitorPollQueue();
  await q.upsertJobScheduler(
    filterKey,
    { every: MONITOR_POLL_INTERVAL_MS },
    { name: "poll", data: { filterKey } }
  );
}

/**
 * Remove the repeatable poll job for a filter set.
 * Call only when the last active monitor with this filter is stopped.
 */
export async function removeMonitorPollJob(filterKey: string): Promise<void> {
  const q = getMonitorPollQueue();
  await q.removeJobScheduler(filterKey);
}
