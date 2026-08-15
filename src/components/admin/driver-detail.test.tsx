import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DriverDetail } from "./driver-detail";

const driverPayload = {
  rider: {
    state: "ACTIVE_OFFLINE",
    onboardingState: "VERIFIED",
    mobile: "8580584898",
    personal: {
      fullName: "Nanban",
      dateOfBirth: "1995-04-15",
      primaryZoneId: "jaipur-c-scheme",
      currentAddress: "C Scheme, Jaipur",
      operatingLocality: "C Scheme",
    },
    vehicle: { type: "ELECTRIC_TWO_WHEELER", registrationNumber: "RJ14NG8580" },
    compliance: { backgroundCheck: "CLEAR" },
    createdAt: "2026-08-15T01:06:00.000Z",
    updatedAt: "2026-08-15T13:18:00.000Z",
  },
  documents: [],
  devices: [],
  sessions: [],
  availability: null,
};

describe("DriverDetail", () => {
  afterEach(() => vi.restoreAllMocks());

  it("presents labelled operations information without raw JSON and groups long histories", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes("/locations?") ? [] : driverPayload;
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <DriverDetail riderId="f8a2a31f-53af-4888-aedc-290e7f3abb8a" />
      </SWRConfig>,
    );

    expect(await screen.findByRole("heading", { name: "Nanban" })).toBeInTheDocument();
    expect(screen.queryByText(/"fullName"/)).not.toBeInTheDocument();
    expect(screen.getByText("RJ14NG8580")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Documents" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Access activity" })).toBeInTheDocument();
  });

  it("makes uploaded documents previewable and downloadable from the driver profile", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes("/locations?")
        ? []
        : {
            ...driverPayload,
            documents: [
              {
                id: "document-1",
                type: "DRIVING_LICENSE",
                status: "PENDING",
                reviewedAt: null,
                updatedAt: "2026-08-15T01:39:00.000Z",
                storageKey: "new-dev/seed/8580584898/DRIVING_LICENSE.jpg",
              },
            ],
          };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <DriverDetail riderId="f8a2a31f-53af-4888-aedc-290e7f3abb8a" />
      </SWRConfig>,
    );

    await screen.findByRole("heading", { name: "Nanban" });
    await user.click(screen.getByRole("tab", { name: "Documents" }));

    const row = screen.getByRole("row", { name: /DRIVING_LICENSE/i });
    expect(within(row).getByRole("button", { name: /preview driving_license/i })).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: /download driving_license/i })).toBeInTheDocument();
  });
});
