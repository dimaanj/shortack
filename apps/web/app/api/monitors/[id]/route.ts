import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getMonitorById,
  getActiveMonitorsByFilter,
  updateMonitorStatus,
} from "@/lib/firestore";
import { removeMonitorPollJob } from "@shortack/queue";
import { getMonitorFilterKey } from "@shortack/monitor-core";

function sessionUserId(session: { user?: { id?: string } } | null): string | null {
  const id = session?.user && "id" in session.user ? session.user.id : null;
  return typeof id === "string" ? id : null;
}

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
    const session = await getServerSession(authOptions);
    const uid = sessionUserId(session as { user?: { id?: string } } | null);
    if (uid != null && monitor.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const session = await getServerSession(authOptions);
    const uid = sessionUserId(session as { user?: { id?: string } } | null);
    if (uid != null && monitor.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const filterKey = getMonitorFilterKey(monitor.from, monitor.to, monitor.date);
    const activeWithSameFilter = await getActiveMonitorsByFilter(
      monitor.from.id,
      monitor.to.id,
      monitor.date
    );
    if (activeWithSameFilter.length === 1) {
      await removeMonitorPollJob(filterKey);
    }
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
