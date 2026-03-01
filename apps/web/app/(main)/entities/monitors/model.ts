"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MonitorRecord } from "@shortack/monitor-core";
import {
  createMonitor,
  getMonitor,
  getMonitors,
  stopMonitor,
  type CreateMonitorInput,
  type CreateMonitorResponse,
} from "./api";

export function useCreateMonitor(): UseMutationResult<
  CreateMonitorResponse,
  Error,
  CreateMonitorInput
> {
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
): {
  monitors: MonitorRecord[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
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

export function useMonitor(id: string | null): {
  monitor: MonitorRecord | null;
  isLoading: boolean;
  error: Error | null;
  isNotFound: boolean;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ["monitors", id],
    queryFn: () => getMonitor(id!),
    enabled: !!id,
  });
  return {
    monitor: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    error: (query.error as Error | null) ?? null,
    isNotFound: query.data === null && !query.isLoading && !query.error,
    refetch: query.refetch,
  };
}

export function useStopMonitor(
  userId: string,
): UseMutationResult<void, Error, string> {
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
