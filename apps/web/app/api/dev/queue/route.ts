import { NextResponse } from "next/server";
import { getMonitorPollQueue } from "@shortack/queue";
import {
  MONITOR_POLL_QUEUE_NAME,
  MONITOR_POLL_INTERVAL_MS,
} from "@shortack/queue";

/** Dev-only: returns job schedulers (repeatable jobs) for monitor:poll queue */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }
  try {
    const queue = getMonitorPollQueue();
    const schedulers = await queue.getJobSchedulers();
    const jobCounts = await queue.getJobCounts();
    return NextResponse.json({
      queueName: MONITOR_POLL_QUEUE_NAME,
      intervalMs: MONITOR_POLL_INTERVAL_MS,
      repeatableJobs: schedulers.map((j) => ({
        id: j.id ?? j.key,
        key: j.key,
        name: j.name,
        next: j.next,
      })),
      jobCounts: {
        waiting: jobCounts.waiting,
        active: jobCounts.active,
        completed: jobCounts.completed,
        failed: jobCounts.failed,
      },
    });
  } catch (error) {
    console.error("GET /api/dev/queue error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Queue error" },
      { status: 500 }
    );
  }
}
