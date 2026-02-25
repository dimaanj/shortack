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
    console.warn("VAPID_PRIVATE_KEY not set, skipping push");
    return;
  }
  const subscriptions = await getPushSubscriptionsByUserId(userId);
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
    } catch (err) {
      console.error(`Push failed for ${sub.endpoint}:`, err);
    }
  }
}

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
      await sendPushForNewSlots(
        monitorId,
        monitor.userId,
        added,
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
