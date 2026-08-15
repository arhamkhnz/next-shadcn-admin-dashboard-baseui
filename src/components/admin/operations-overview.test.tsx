import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OperationsOverview } from "./operations-overview";

describe("OperationsOverview", () => {
  afterEach(() => vi.restoreAllMocks());

  it("turns metrics and alerts into navigable operational shortcuts with infographic sections", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          metrics: {
            riderCount: 7,
            onlineCount: 3,
            activeOrderCount: 2,
            openCaseCount: 1,
            activeIncidentCount: 2,
            pendingPayoutCount: 0,
          },
          alerts: [
            {
              severity: "critical",
              code: "SOS_ACK_SLA",
              count: 1,
              message: "SOS incidents have not been acknowledged within 60 seconds.",
            },
          ],
          orderAgeing: [{ state: "READY_FOR_ASSIGNMENT", count: 8, oldestAt: "2026-08-15T08:00:00.000Z" }],
          zoneSupply: [{ zoneId: "jaipur-core", onlineRiders: 3 }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <OperationsOverview />
      </SWRConfig>,
    );

    expect(await screen.findByRole("link", { name: /Total drivers/i })).toHaveAttribute("href", "/dashboard/drivers");
    expect(screen.getByRole("link", { name: /Online now/i })).toHaveAttribute("href", "/dashboard/map");
    expect(screen.getByRole("link", { name: /Active deliveries/i })).toHaveAttribute("href", "/dashboard/orders");
    expect(screen.getByRole("link", { name: /SOS ACK SLA/i })).toHaveAttribute("href", "/dashboard/safety");
    expect(screen.getByRole("heading", { name: "Operations health" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Order ageing infographic" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Driver supply infographic" })).toBeInTheDocument();
    expect(screen.getByText("READY_FOR_ASSIGNMENT")).toBeInTheDocument();
    expect(screen.getByText("jaipur-core")).toBeInTheDocument();
  });
});
