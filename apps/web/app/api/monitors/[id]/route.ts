import { NextRequest, NextResponse } from "next/server";
import { getMonitorById, updateMonitorStatus } from "@/lib/firestore";
import { removeMonitorPollJob } from "@shortack/queue";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const monitor = await getMonitorById(id);
    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
    }
    return NextResponse.json(monitor);
  } catch (error) {
    console.error("GET /api/monitors/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to get monitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const monitor = await getMonitorById(id);
    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
    }
    await removeMonitorPollJob(id);
    await updateMonitorStatus(id, "STOPPED");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/monitors/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to stop monitor" },
      { status: 500 }
    );
  }
}
