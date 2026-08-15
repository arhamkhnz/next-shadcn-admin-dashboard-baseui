import { describe, expect, it } from "vitest";

import { displayValue, rowsFromPayload, titleFromKey } from "./display";

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
});
