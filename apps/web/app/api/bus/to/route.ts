import { NextRequest, NextResponse } from "next/server";
import { getToDestinations } from "../../../../lib/bus-provider";

export async function GET(request: NextRequest) {
  const fromId = request.nextUrl.searchParams.get("fromId");
  const fromName = request.nextUrl.searchParams.get("fromName");

  if (!fromId || !fromName) {
    return NextResponse.json(
      { error: "Missing fromId or fromName" },
      { status: 400 }
    );
  }

  try {
    const destinations = await getToDestinations({
      id: fromId,
      name: fromName,
    });
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("getToDestinations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
