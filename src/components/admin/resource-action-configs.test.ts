import { describe, expect, it } from "vitest";

import {
  APPROVAL_ACTIONS,
  DRIVER_ACTIONS,
  FINANCE_DISPUTE_ACTIONS,
  FRAUD_SIGNAL_ACTIONS,
  SAFETY_INCIDENT_ACTIONS,
  SUPPORT_CASE_ACTIONS,
} from "./resource-action-configs";

describe("operations row action coverage", () => {
  it("covers every former manual-ID action on its record", () => {
    expect(SUPPORT_CASE_ACTIONS.map((action) => action.id)).toEqual(["reply", "status"]);
    expect(SAFETY_INCIDENT_ACTIONS.map((action) => action.id)).toEqual(["acknowledge", "resolve"]);
    expect(FRAUD_SIGNAL_ACTIONS.map((action) => action.id)).toEqual(["review"]);
    expect(FINANCE_DISPUTE_ACTIONS.map((action) => action.id)).toEqual(["resolve"]);
    expect(APPROVAL_ACTIONS.map((action) => action.id)).toEqual(["approve"]);
    expect(DRIVER_ACTIONS.map((action) => action.id)).toEqual(["change-state"]);
  });

  it("never asks for a record ID as an action field", () => {
    const actions = [
      ...SUPPORT_CASE_ACTIONS,
      ...SAFETY_INCIDENT_ACTIONS,
      ...FRAUD_SIGNAL_ACTIONS,
      ...FINANCE_DISPUTE_ACTIONS,
      ...APPROVAL_ACTIONS,
      ...DRIVER_ACTIONS,
    ];

    expect(actions.flatMap((action) => action.fields ?? []).some((field) => field.name === "id")).toBe(false);
    expect(actions.every((action) => action.endpoint.includes("{id}"))).toBe(true);
  });
});
