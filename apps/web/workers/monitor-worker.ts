import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import pino from "pino";
import { Worker } from "bullmq";
import webPush from "web-push";
import {
  getConnection,
  MONITOR_POLL_QUEUE_NAME,
  type MonitorPollJobData,
} from "@shortack/queue";
import { getAvailableTimeSlots } from "../lib/bus-provider";
import { getSlotDiff, stringToDate } from "@shortack/monitor-core";
import {
  getMonitorById,
  updateMonitorPrevSlots,
  getPushSubscriptionsByUserId,
} from "./firestore";

const log = pino(
  process.env.NODE_ENV === "development"
    ? { name: "monitor-worker", transport: { target: "pino-pretty", options: { colorize: true } } }
    : { name: "monitor-worker" }
);

const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (vapidPrivateKey) {
  webPush.setVapidDetails(
    "mailto:dev@shortack.local",
    process.env.VAPID_PUBLIC_KEY!,
    vapidPrivateKey
  );
}

const connection = getConnection();

async function sendPushForNewSlots(
  monitorId: string,
  userId: string,
  added: string[],
  fromName: string,
  toName: string
): Promise<void> {
  if (!vapidPrivateKey) {
    log.warn({ monitorId, userId }, "VAPID_PRIVATE_KEY not set, skipping push");
    return;
  }
  const subscriptions = await getPushSubscriptionsByUserId(userId);
  if (subscriptions.length === 0) {
    log.info({ monitorId, userId }, "Triggering push but no subscriptions for userId");
    return;
  }
  log.info(
    { monitorId, userId, newSlots: added, subscriptionCount: subscriptions.length },
    "Triggering push notifications"
  );
  const payload = JSON.stringify({
    title: "Seats available",
    body: `${fromName} → ${toName}: ${added.join(", ")}`,
    url: `/monitors/${monitorId}`,
  });
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        payload,
        { TTL: 60 }
      );
      log.info({ monitorId, endpoint: sub.endpoint?.slice(0, 60) }, "Push sent");
    } catch (err) {
      log.error({ monitorId, endpoint: sub.endpoint, err }, "Push failed");
    }
  }
}

const worker = new Worker<MonitorPollJobData>(
  MONITOR_POLL_QUEUE_NAME,
  async (job) => {
    const { monitorId } = job.data;
    const monitor = await getMonitorById(monitorId);
    if (!monitor) {
      log.warn({ monitorId }, "Monitor not found, skipping");
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
    // TEMPORARY: send push when any slots exist (for testing). Revert to: added.length > 0
    const slotsToNotify = currSlots.length > 0 ? currSlots : added;
    if (slotsToNotify.length > 0) {
      log.info({ monitorId, slots: slotsToNotify }, "Slots available, sending push notifications");
      await sendPushForNewSlots(
        monitorId,
        monitor.userId,
        slotsToNotify,
        monitor.from.name,
        monitor.to.name
      );
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  log.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, err) => {
  log.error({ jobId: job?.id, err }, "Job failed");
});

log.info("Monitor worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
