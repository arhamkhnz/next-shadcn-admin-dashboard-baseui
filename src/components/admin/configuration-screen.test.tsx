import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigurationScreen } from "./configuration-screen";

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("ConfigurationScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("supports presets, validates JSON, and publishes an optional effective-to date", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      if (init?.method === "POST") return response({ id: "configuration-1" });
      return response([]);
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <ConfigurationScreen
          title="Platform configurations"
          description="Versioned operational, dispatch, pricing, payout, and policy controls."
          keyPlaceholder="dispatch.offer.timeout"
          example={'{\n  "seconds": 20\n}'}
        />
      </SWRConfig>,
    );

    await user.click(screen.getByRole("button", { name: "Dispatch timeout" }));
    expect(screen.getByLabelText("Configuration key")).toHaveValue("dispatch.offer.timeout");
    expect(screen.getByLabelText("JSON value")).toHaveValue('{\n  "seconds": 20\n}');
    expect(screen.getByText("Valid JSON")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("JSON value"));
    fireEvent.change(screen.getByLabelText("JSON value"), { target: { value: "{" } });
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("JSON value"));
    fireEvent.change(screen.getByLabelText("JSON value"), { target: { value: '{ "seconds": 35 }' } });
    await user.type(screen.getByLabelText("Change reason"), "OPS-55 extend assignment window");
    await user.type(screen.getByLabelText("Effective to"), "2026-09-01T09:30");
    await user.click(screen.getByRole("button", { name: "Publish configuration" }));

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
    const body = JSON.parse(String(postCall?.[1]?.body));
    expect(body).toEqual({
      key: "dispatch.offer.timeout",
      value: { seconds: 35 },
      scope: {},
      effectiveFrom: expect.any(String),
      effectiveTo: new Date("2026-09-01T09:30").toISOString(),
      changeReason: "OPS-55 extend assignment window",
    });
  });
});
