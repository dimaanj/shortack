import { useQuery } from "@tanstack/react-query";
import type { DestinationInfo } from "@shortack/monitor-core";
import type { RouteState } from "./types";
import { getFromDestinations, getSlots, getToDestinations } from "../data/busApi";

export function useTripRoutes(route: RouteState) {
  const {
    data: fromOptions,
    isLoading: isFromLoading,
    error: fromError,
  } = useQuery({
    queryKey: ["bus", "from"],
    queryFn: getFromDestinations,
  });

  const {
    data: toOptions,
    isLoading: isToLoading,
    error: toError,
  } = useQuery({
    queryKey: ["bus", "to", route.from?.id],
    queryFn: () => getToDestinations(route.from as DestinationInfo),
    enabled: !!route.from,
  });

  const isLoading = isFromLoading || isToLoading;
  const error = (fromError ?? toError) as Error | null;

  return {
    fromOptions: fromOptions ?? [],
    toOptions: toOptions ?? [],
    isLoading,
    error,
  };
}

export function useTripSlots(route: RouteState, selectedDate: string) {
  const {
    data: slotsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bus", "slots", route.from?.id, route.to?.id, selectedDate],
    queryFn: () => getSlots(route, selectedDate),
    enabled: !!route.from && !!route.to && !!selectedDate,
  });

  return {
    slots: slotsData?.slots ?? [],
    isLoading,
    error: error as Error | null,
  };
}

