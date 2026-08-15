import { describe, expect, it } from "vitest";

import {
  classifyFleetRider,
  type FleetLocation,
  type FleetRider,
  findFleetRiderForOrder,
  findFleetRiderForTrip,
  fleetBounds,
  fleetRidersWithLocations,
} from "./fleet-map";

function location(overrides: Partial<FleetLocation> = {}): FleetLocation {
  return {
    latitude: 26.9124,
    longitude: 75.7873,
    accuracyM: 10,
    speedMps: 0,
    speedSource: "DEVICE",
    bearingDeg: null,
    batteryPercent: 80,
    networkType: "4G",
    capturedAt: "2026-08-15T13:00:00.000Z",
    receivedAt: "2026-08-15T13:00:01.000Z",
    freshness: "FRESH",
    ...overrides,
  };
}

function rider(overrides: Partial<FleetRider> = {}): FleetRider {
  return {
    riderId: "rider-1",
    name: "Nanban",
    maskedMobile: "••••••4898",
    vehicle: { type: "BIKE", registrationNumber: "RJ14NG8580" },
    state: "ACTIVE_OFFLINE",
    zoneId: "jaipur",
    location: location(),
    trail: [],
    activeWork: null,
    safety: null,
    ...overrides,
  };
}

describe("fleet map helpers", () => {
  it("distinguishes online, offline last-known, and safety markers", () => {
    expect(classifyFleetRider(rider({ state: "ACTIVE_ONLINE" }))).toBe("online");
    expect(classifyFleetRider(rider({ state: "ACTIVE_OFFLINE" }))).toBe("offline");
    expect(classifyFleetRider(rider({ safety: { incidentId: "incident-1", status: "OPEN", reasonCode: "SOS" } }))).toBe(
      "safety",
    );
  });

  it("keeps valid last-known locations and rejects missing or invalid coordinates", () => {
    const valid = rider();
    const missing = rider({ riderId: "rider-2", location: null });
    const invalid = rider({ riderId: "rider-3", location: location({ latitude: 120 }) });

    expect(fleetRidersWithLocations([valid, missing, invalid]).map((item) => item.riderId)).toEqual(["rider-1"]);
  });

  it("builds bounds that include every visible driver", () => {
    expect(
      fleetBounds([
        rider({ location: location({ latitude: 26.9, longitude: 75.7 }) }),
        rider({ riderId: "rider-2", location: location({ latitude: 27.1, longitude: 76.2 }) }),
      ]),
    ).toEqual([
      [26.9, 75.7],
      [27.1, 76.2],
    ]);
  });

  it("matches a trip driver through the rider's active passenger trip when identifier namespaces differ", () => {
    const assigned = rider({
      riderId: "platform-rider-id",
      activeWork: { kind: "PASSENGER_RIDE", id: "legacy-trip-id", state: "IN_TRANSIT" },
    });

    expect(findFleetRiderForTrip([assigned], { id: "legacy-trip-id", driverId: "legacy-user-id" })).toBe(assigned);
  });

  it("matches an order rider through either assignment or active delivery work", () => {
    const assigned = rider({ riderId: "rider-1" });
    const active = rider({
      riderId: "rider-2",
      activeWork: { kind: "DELIVERY_ORDER", id: "order-2", state: "EN_ROUTE_DROP" },
    });

    expect(findFleetRiderForOrder([assigned, active], { id: "order-1", riderId: "rider-1" })).toBe(assigned);
    expect(findFleetRiderForOrder([assigned, active], { id: "order-2" })).toBe(active);
  });
});
