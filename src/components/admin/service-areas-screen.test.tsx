import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServiceAreasScreen } from "./service-areas-screen";

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("ServiceAreasScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a guided service-area workspace and publishes zone JSON", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      if (init?.method === "POST") return response({ id: "configuration-1" });
      return response([
        {
          id: "config-1",
          key: "serviceArea.jaipur.core",
          value: {
            enabled: true,
            vehicleTypes: ["BIKE", "AUTO"],
            operatingHours: { start: "06:00", end: "23:00" },
            capacity: { maxActiveDrivers: 120 },
          },
          version: 2,
          createdAt: "2026-08-16T00:00:00.000Z",
        },
      ]);
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <ServiceAreasScreen />
      </SWRConfig>,
    );

    expect(await screen.findByRole("heading", { name: "Service areas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Zone command centre" })).toBeInTheDocument();
    expect(screen.getByText("Jaipur core")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Airport logistics" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Airport logistics" }));
    expect(screen.getByLabelText("Configuration key")).toHaveValue("serviceArea.jaipur.airport");
    expect((screen.getByLabelText("Zone JSON") as HTMLTextAreaElement).value).toContain("AIRPORT_TRANSFER");

    await user.type(screen.getByLabelText("Change reason"), "OPS-91 adjust airport fleet");
    fireEvent.change(screen.getByLabelText("Zone JSON"), {
      target: {
        value: '{ "enabled": true, "vehicleTypes": ["BIKE"], "operatingHours": { "start": "05:00", "end": "23:30" } }',
      },
    });
    await user.click(screen.getByRole("button", { name: "Publish zone update" }));

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
      key: "serviceArea.jaipur.airport",
      value: {
        enabled: true,
        vehicleTypes: ["BIKE"],
        operatingHours: { start: "05:00", end: "23:30" },
      },
      scope: { domain: "service-area" },
      effectiveFrom: expect.any(String),
      changeReason: "OPS-91 adjust airport fleet",
    });
  });
});
