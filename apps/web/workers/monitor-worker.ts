import { Worker } from "bullmq";
import {
  getConnection,
  MONITOR_POLL_QUEUE_NAME,
  type MonitorPollJobData,
} from "@shortack/queue";
import { getAvailableTimeSlots } from "../lib/bus-provider";
import { getSlotDiff, stringToDate } from "@shortack/monitor-core";
import { getMonitorById, updateMonitorPrevSlots } from "./firestore";

const connection = getConnection();

const worker = new Worker<MonitorPollJobData>(
  MONITOR_POLL_QUEUE_NAME,
  async (job) => {
    const { monitorId } = job.data;
    const monitor = await getMonitorById(monitorId);
    if (!monitor) {
      console.warn(`Monitor ${monitorId} not found, skipping`);
      return;
    }
    if (monitor.status !== "ACTIVE") {
      return;
    }
    const date = stringToDate(monitor.date);
    const currSlots = await getAvailableTimeSlots({
      from: monitor.from,
      to: monitor.to,
      date,
    });
    const { added } = getSlotDiff(monitor.prevSlots, currSlots);
    await updateMonitorPrevSlots(monitorId, currSlots);
    if (added.length > 0) {
      console.log(`Monitor ${monitorId}: new slots ${added.join(", ")}`);
      // Phase 3: enqueue push notification job
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Monitor worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
