import type { DestinationInfo } from "./types.js";

const FILTER_KEY_SEP = ":";

/**
 * Builds a stable key for a monitor filter (from, to, date).
 * One repeatable job per key; multiple users can share the same job.
 * Format: fromId:toId:date (date yyyy-mm-dd).
 */
export function getMonitorFilterKey(
  from: DestinationInfo,
  to: DestinationInfo,
  date: string
): string {
  return [from.id, to.id, date].join(FILTER_KEY_SEP);
}

export type ParsedFilterKey = {
  fromId: string;
  toId: string;
  date: string;
};

/**
 * Parses a filter key produced by getMonitorFilterKey.
 * Use when the worker has only filterKey and needs fromId, toId, date for Firestore query.
 */
export function parseMonitorFilterKey(filterKey: string): ParsedFilterKey {
  const parts = filterKey.split(FILTER_KEY_SEP);
  if (parts.length !== 3) {
    throw new Error(`Invalid monitor filter key: ${filterKey}`);
  }
  return { fromId: parts[0], toId: parts[1], date: parts[2] };
}
