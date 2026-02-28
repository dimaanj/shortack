"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMonitor,
  getMonitors,
  stopMonitor,
  type CreateMonitorInput,
} from "./api";

export function useCreateMonitor() {
  return useMutation({
    mutationKey: ["monitors", "create"],
    mutationFn: (input: CreateMonitorInput) => createMonitor(input),
  });
}

export function useMonitors(
  userId: string,
  options?: {
    refetchIntervalMs?: number;
  },
) {
  const trimmed = userId.trim();

  const query = useQuery({
    queryKey: ["monitors", trimmed],
    queryFn: () => getMonitors(trimmed),
    enabled: !!trimmed,
    refetchInterval: options?.refetchIntervalMs,
    refetchIntervalInBackground: !!options?.refetchIntervalMs,
  });

  return {
    monitors: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: (query.error as Error | null) ?? null,
    refetch: query.refetch,
  };
}

export function useStopMonitor(userId: string) {
  const client = useQueryClient();
  const trimmed = userId.trim();

  return useMutation({
    mutationKey: ["monitors", "stop", trimmed],
    mutationFn: (id: string) => stopMonitor(id),
    onSuccess: () => {
      if (trimmed) {
        client.invalidateQueries({ queryKey: ["monitors", trimmed] });
      }
    },
  });
}
