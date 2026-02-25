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

/** Add a repeatable poll job for a monitor (every 20s). Call when creating a monitor. */
export async function addMonitorPollJob(monitorId: string): Promise<void> {
  const q = getMonitorPollQueue();
  await q.add(
    "poll",
    { monitorId },
    {
      jobId: monitorId,
      repeat: {
        every: MONITOR_POLL_INTERVAL_MS,
      },
    }
  );
}

/** Remove the repeatable poll job for a monitor. Call when stopping a monitor. */
export async function removeMonitorPollJob(monitorId: string): Promise<void> {
  const q = getMonitorPollQueue();
  const repeatableJobs = await q.getRepeatableJobs();
  const job = repeatableJobs.find(
    (j) => j.id === monitorId || (j.key?.includes(monitorId) ?? false)
  );
  if (job?.key) await q.removeRepeatableByKey(job.key);
}
