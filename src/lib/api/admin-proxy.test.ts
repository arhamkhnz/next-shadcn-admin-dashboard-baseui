import { describe, expect, it } from "vitest";

import { isAllowedAdminProxyRequest, isSameOrigin } from "./admin-proxy";

describe("admin backend proxy boundary", () => {
  it("only permits explicitly supported admin resources", () => {
    expect(isAllowedAdminProxyRequest("GET", "operations/platform/fleet")).toBe(true);
    expect(isAllowedAdminProxyRequest("PATCH", "trips/123/cancel")).toBe(true);
    expect(isAllowedAdminProxyRequest("GET", "admin/auth/login")).toBe(false);
    expect(isAllowedAdminProxyRequest("GET", "../platform/observability/metrics")).toBe(false);
    expect(isAllowedAdminProxyRequest("GET", "webhooks/razorpay/payouts")).toBe(false);
  });

  it("requires an exact same origin for mutations", () => {
    expect(isSameOrigin("https://admin.liftngo.in", "https://admin.liftngo.in")).toBe(true);
    expect(isSameOrigin("https://evil.example", "https://admin.liftngo.in")).toBe(false);
    expect(isSameOrigin(null, "https://admin.liftngo.in")).toBe(false);
  });
});
