import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimeSlots } from "@shortack/bus-provider";

export async function GET(request: NextRequest) {
  const fromId = request.nextUrl.searchParams.get("fromId");
  const fromName = request.nextUrl.searchParams.get("fromName");
  const toId = request.nextUrl.searchParams.get("toId");
  const toName = request.nextUrl.searchParams.get("toName");
  const date = request.nextUrl.searchParams.get("date");

  if (!fromId || !fromName || !toId || !toName || !date) {
    return NextResponse.json(
      { error: "Missing fromId, fromName, toId, toName, or date" },
      { status: 400 }
    );
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const slots = await getAvailableTimeSlots({
      from: { id: fromId, name: fromName },
      to: { id: toId, name: toName },
      date: dateObj,
    });
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("getAvailableTimeSlots error:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}
