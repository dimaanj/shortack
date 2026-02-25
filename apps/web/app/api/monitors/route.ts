import { NextRequest, NextResponse } from "next/server";
import { createMonitor } from "@/lib/firestore";
import { addMonitorPollJob } from "@shortack/queue";
import type { DestinationInfo } from "@shortack/monitor-core";
import { randomBytes } from "crypto";

function generateId(): string {
  return randomBytes(4).toString("hex");
}

function parseBody(body: unknown): {
  userId: string;
  from: DestinationInfo;
  to: DestinationInfo;
  date: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const userId = typeof o.userId === "string" ? o.userId : null;
  const from =
    o.from && typeof o.from === "object" && "id" in o.from && "name" in o.from
      ? (o.from as DestinationInfo)
      : null;
  const to =
    o.to && typeof o.to === "object" && "id" in o.to && "name" in o.to
      ? (o.to as DestinationInfo)
      : null;
  const date = typeof o.date === "string" ? o.date : null;
  if (!userId || !from || !to || !date) return null;
  return { userId, from, to, date };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json(
      { error: "Missing or invalid userId, from, to, date" },
      { status: 400 }
    );
  }
  const { userId, from, to, date } = parsed;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json({ error: "Invalid date format (use yyyy-mm-dd)" }, { status: 400 });
  }
  try {
    const id = generateId();
    const record = await createMonitor(id, {
      userId,
      busProvider: "MARSHRUTOCHKA",
      from,
      to,
      date,
    });
    await addMonitorPollJob(id);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/monitors error:", error);
    return NextResponse.json(
      { error: "Failed to create monitor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId query parameter" },
      { status: 400 }
    );
  }
  try {
    const { listMonitorsByUserId } = await import("@/lib/firestore");
    const monitors = await listMonitorsByUserId(userId);
    return NextResponse.json(monitors);
  } catch (error) {
    console.error("GET /api/monitors error:", error);
    return NextResponse.json(
      { error: "Failed to list monitors" },
      { status: 500 }
    );
  }
}
