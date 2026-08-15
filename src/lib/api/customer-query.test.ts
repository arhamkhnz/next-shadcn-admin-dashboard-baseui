import { describe, expect, it } from "vitest";

import { CUSTOMERS_API_ENDPOINT, CUSTOMERS_ENDPOINT } from "./customer-query";

describe("customer role query", () => {
  it("requests customer members with the enum-array containment operator", () => {
    expect(CUSTOMERS_ENDPOINT).toBe("users?limit=100&filter.role=$contains:CUSTOMER");
    expect(CUSTOMERS_API_ENDPOINT).toBe(`/api/backend/${CUSTOMERS_ENDPOINT}`);
    expect(CUSTOMERS_ENDPOINT).not.toContain("$eq:CUSTOMER");
  });
});
