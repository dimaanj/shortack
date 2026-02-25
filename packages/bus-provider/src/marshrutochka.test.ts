import { describe, it, expect } from "vitest";
import { getMaxFutureDateForMonitor } from "./marshrutochka.js";

describe("getMaxFutureDateForMonitor", () => {
  it("returns a date 7 days ahead", () => {
    const result = getMaxFutureDateForMonitor();
    const now = new Date();
    const expected = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7
    );
    expect(result.getTime()).toBe(expected.getTime());
  });
});
