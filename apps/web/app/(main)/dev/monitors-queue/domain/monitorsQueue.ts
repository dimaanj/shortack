"use client";

import { useQuery } from "@tanstack/react-query";
import { getDevMonitors, getQueueInfo, type MonitorRecord, type QueueInfo } from "../data/queueApi";

export function useDevMonitors(userId: string) {
  const trimmed = userId.trim();

  const query = useQuery<MonitorRecord[]>({
    queryKey: ["dev", "monitors", trimmed],
    queryFn: () => getDevMonitors(trimmed),
    enabled: !!trimmed,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  return {
    monitors: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: (query.error as Error | null) ?? null,
  };
}

export function useQueueInfo() {
  const query = useQuery<QueueInfo | null>({
    queryKey: ["dev", "queue"],
    queryFn: getQueueInfo,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  return {
    queueInfo: query.data,
    isLoading: query.isLoading || query.isFetching,
    error: (query.error as Error | null) ?? null,
  };
}

