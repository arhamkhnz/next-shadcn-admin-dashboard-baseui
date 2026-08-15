import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PromotionsScreen } from "./promotions-screen";

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("PromotionsScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a guided campaign workspace and publishes campaign JSON", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      if (init?.method === "POST") return response({ id: "configuration-1" });
      return response([
        {
          id: "promo-1",
          key: "promotions.campaign.welcome",
          version: 3,
          value: {
            enabled: true,
            code: "WELCOME10",
            discountPercent: 10,
            usageLimit: 100,
            audience: "NEW_CUSTOMERS",
          },
          createdAt: "2026-08-16T00:00:00.000Z",
        },
      ]);
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <PromotionsScreen />
      </SWRConfig>,
    );

    expect(await screen.findByRole("heading", { name: "Promotions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Campaign command centre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Welcome coupon" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rider incentive" }));
    expect(screen.getByLabelText("Configuration key")).toHaveValue("promotions.incentive.rider-peak");
    expect((screen.getByLabelText("Campaign JSON") as HTMLTextAreaElement).value).toContain("PEAKRIDER");

    await user.type(screen.getByLabelText("Change reason"), "MKT-44 launch peak rider incentive");
    fireEvent.change(screen.getByLabelText("Campaign JSON"), {
      target: {
        value:
          '{ "enabled": true, "code": "PEAKRIDER", "discountPercent": 0, "usageLimit": 250, "audience": "RIDERS" }',
      },
    });
    await user.click(screen.getByRole("button", { name: "Publish campaign" }));

    await waitFor(() =>
      expect(
        request.mock.calls.some(
          ([url, init]) => url === "/api/backend/operations/platform/configurations" && init?.method === "POST",
        ),
      ).toBe(true),
    );
    const postCall = request.mock.calls.find(
      ([url, init]) => url === "/api/backend/operations/platform/configurations" && init?.method === "POST",
    );
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({
      key: "promotions.incentive.rider-peak",
      value: {
        enabled: true,
        code: "PEAKRIDER",
        discountPercent: 0,
        usageLimit: 250,
        audience: "RIDERS",
      },
      scope: { domain: "promotions" },
      effectiveFrom: expect.any(String),
      changeReason: "MKT-44 launch peak rider incentive",
    });
  });
});
