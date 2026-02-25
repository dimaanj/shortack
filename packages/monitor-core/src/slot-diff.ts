import { diff } from "fast-array-diff";
import type { AvailableTimeSlot, SlotDiff } from "./types.js";

export function getSlotDiff(
  prevSlots: AvailableTimeSlot[],
  currSlots: AvailableTimeSlot[]
): SlotDiff {
  const result = diff(prevSlots, currSlots);
  return {
    added: result.added ?? [],
    removed: result.removed ?? [],
  };
}
