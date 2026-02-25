import { NextResponse } from "next/server";
import { getFromDestinations } from "@shortack/bus-provider";

export async function GET() {
  try {
    const destinations = await getFromDestinations();
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("getFromDestinations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
