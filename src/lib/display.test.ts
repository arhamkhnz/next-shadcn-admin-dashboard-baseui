import { describe, expect, it } from "vitest";

import {
  displayValue,
  formatResourceValue,
  recordLabel,
  rowsFromPayload,
  summarizeObject,
  titleFromKey,
} from "./display";

describe("admin display helpers", () => {
  it("turns API fields into readable labels and values", () => {
    expect(titleFromKey("capturedAt")).toBe("Captured At");
    expect(displayValue(null)).toBe("—");
    expect(displayValue(true)).toBe("Yes");
  });

  it("reads direct and paginated payload rows", () => {
    expect(rowsFromPayload([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(rowsFromPayload({ data: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(rowsFromPayload({ riders: [{ id: 3 }] }, "riders")).toEqual([{ id: 3 }]);
  });

  it("formats backend-shaped values for operations staff", () => {
    expect(formatResourceValue("amountPaise", 12345)).toBe("₹123.45");
    expect(
      summarizeObject("personal", {
        fullName: "Nanban",
        operatingLocality: "C Scheme",
      }),
    ).toBe("Nanban · C Scheme");
    expect(
      summarizeObject("vehicle", {
        type: "ELECTRIC_TWO_WHEELER",
        registrationNumber: "RJ14NG8580",
      }),
    ).toBe("Electric two wheeler · RJ14NG8580");
    expect(formatResourceValue("evidence", { score: 7, source: "velocity" })).toBe("2 details");
  });

  it("chooses a human record label before falling back to a compact ID", () => {
    expect(recordLabel({ id: "f8a2a31f-53af-4888-aedc-290e7f3abb8a", name: "Nanban" }, ["name"])).toBe("Nanban");
    expect(recordLabel({ id: "f8a2a31f-53af-4888-aedc-290e7f3abb8a" })).toBe("f8a2a31f…abb8a");
  });
});
