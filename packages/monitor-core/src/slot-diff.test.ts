import { describe, it, expect } from "vitest";
import { getSlotDiff } from "./slot-diff.js";

describe("getSlotDiff", () => {
  it("returns added slots when new slots appear", () => {
    const prev = ["10:00", "12:00"];
    const curr = ["10:00", "11:00", "12:00"];
    expect(getSlotDiff(prev, curr)).toEqual({ added: ["11:00"], removed: [] });
  });

  it("returns removed slots when slots disappear", () => {
    const prev = ["10:00", "11:00", "12:00"];
    const curr = ["10:00", "12:00"];
    expect(getSlotDiff(prev, curr)).toEqual({ added: [], removed: ["11:00"] });
  });

  it("returns both added and removed", () => {
    const prev = ["10:00", "12:00"];
    const curr = ["10:00", "11:00", "13:00"];
    expect(getSlotDiff(prev, curr)).toEqual({
      added: ["11:00", "13:00"],
      removed: ["12:00"],
    });
  });

  it("returns empty when arrays are identical", () => {
    const slots = ["10:00", "12:00"];
    expect(getSlotDiff(slots, slots)).toEqual({ added: [], removed: [] });
  });
});
