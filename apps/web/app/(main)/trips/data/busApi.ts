import type { DestinationInfo } from "@shortack/monitor-core";
import type { RouteState } from "../domain/types";

type SlotsResponse = {
  slots?: string[];
  error?: string;
};

export async function getFromDestinations(): Promise<DestinationInfo[]> {
  const response = await fetch("/api/bus/from");
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getToDestinations(
  from: DestinationInfo,
): Promise<DestinationInfo[]> {
  const params = new URLSearchParams({
    fromId: from.id,
    fromName: from.name,
  });

  const response = await fetch(`/api/bus/to?${params.toString()}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getSlots(
  route: RouteState,
  selectedDate: string,
): Promise<SlotsResponse> {
  const params = new URLSearchParams({
    fromId: route.from!.id,
    fromName: route.from!.name,
    toId: route.to!.id,
    toName: route.to!.name,
    date: selectedDate,
  });

  const response = await fetch(`/api/bus/slots?${params.toString()}`);
  const data: SlotsResponse = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

