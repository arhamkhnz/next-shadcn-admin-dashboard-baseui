import { describe, expect, it } from "vitest";

import { isResourceActionAvailable, type ResourceAction, resolveRecordEndpoint } from "./resource-types";

describe("resource action contracts", () => {
  it("resolves and encodes the selected row ID without asking for manual input", () => {
    expect(resolveRecordEndpoint("operations/support/cases/{id}/messages", { id: "case/with space" }, "id")).toBe(
      "operations/support/cases/case%2Fwith%20space/messages",
    );
  });

  it("resolves named row placeholders", () => {
    expect(resolveRecordEndpoint("drivers/{riderId}/orders/{orderId}", { riderId: "r 1", orderId: "o/2" }, "id")).toBe(
      "drivers/r%201/orders/o%2F2",
    );
  });

  it("filters actions using the current record state", () => {
    const action: ResourceAction = {
      id: "acknowledge",
      label: "Acknowledge",
      endpoint: "incidents/{id}/acknowledge",
      when: { key: "status", in: ["OPEN"] },
    };

    expect(isResourceActionAvailable(action, { status: "OPEN" })).toBe(true);
    expect(isResourceActionAvailable(action, { status: "RESOLVED" })).toBe(false);
  });
});
