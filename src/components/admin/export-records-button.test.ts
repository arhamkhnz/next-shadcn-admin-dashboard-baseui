import { describe, expect, it } from "vitest";

import { recordsToCsv } from "./export-records-button";

describe("recordsToCsv", () => {
  it("exports readable CSV with escaped cells", () => {
    const csv = recordsToCsv(
      [
        {
          name: 'GVD "Partner"',
          mobile: "9355471999",
          personal: { fullName: "Nanban", operatingLocality: "C Scheme" },
        },
      ],
      ["name", "mobile", "personal"],
    );

    expect(csv).toBe('Name,Mobile,Personal\r\n"GVD ""Partner""",9355471999,Nanban · C Scheme');
  });
});
