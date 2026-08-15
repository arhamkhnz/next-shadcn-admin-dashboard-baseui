import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LiveDriverMap } from "./live-driver-map";

vi.mock("leaflet", () => {
  const map = {
    setView: vi.fn(() => map),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    remove: vi.fn(),
  };
  const layer = {
    addTo: vi.fn(() => layer),
    clearLayers: vi.fn(),
  };
  const marker = {
    bindTooltip: vi.fn(() => marker),
    on: vi.fn(() => marker),
    addTo: vi.fn(() => marker),
  };
  return {
    map: vi.fn(() => map),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => layer),
    circleMarker: vi.fn(() => marker),
  };
});

function response(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("LiveDriverMap", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers CSV export for the filtered fleet map drivers", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      response({
        serverTime: "2026-08-16T00:00:00.000Z",
        sequence: 1,
        riders: [
          {
            riderId: "driver-1",
            name: "Driver One",
            state: "ACTIVE_ONLINE",
            maskedMobile: "xxxxxx9999",
            zoneId: "jaipur",
            vehicle: { type: "BIKE", registrationNumber: "RJ14NG8580" },
            location: {
              latitude: 26.9124,
              longitude: 75.7873,
              capturedAt: "2026-08-16T00:00:00.000Z",
              accuracyM: 12,
              speedMps: 4,
              speedSource: "GPS",
              batteryPercent: 88,
              networkType: "4G",
              freshness: "FRESH",
            },
          },
        ],
      }),
    );

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <LiveDriverMap />
      </SWRConfig>,
    );

    expect(await screen.findByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });
});
