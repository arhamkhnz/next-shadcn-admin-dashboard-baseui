import { describe, expect, it } from "vitest";

import {
  curvedFallbackRoute,
  formatDistance,
  formatDuration,
  locationInspectorText,
  normaliseTrip,
  routeForDisplay,
  tripRouteBounds,
  validLocation,
} from "./trip-route";

const rawTrip = {
  id: "33333333-3333-4333-8333-333333333311",
  tripCode: "LOCALRIDE1001",
  customerId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
  driverId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
  status: "IN_TRANSIT",
  vehicleType: "AUTO_THREE_WHEELER",
  originAddress: "Bani Park, Jaipur, Rajasthan",
  originLatitude: "26.9321",
  originLongitude: 75.7932,
  destinationAddress: "Hawa Mahal, Jaipur, Rajasthan",
  destinationLatitude: 26.9239,
  destinationLongitude: "75.8267",
  estimatedDistanceMeters: 5100,
  estimatedDurationSeconds: 1080,
  estimatedFare: 185,
  currency: "INR",
  createdAt: "2026-08-15T10:00:00.000Z",
  customer: { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1", firstName: "Jaipur", lastName: "Passenger" },
  driver: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2", firstName: "Meera", lastName: "Singh" },
};

describe("trip route helpers", () => {
  it("normalises trip people, route, fare, and timing fields", () => {
    const trip = normaliseTrip(rawTrip);

    expect(trip).toMatchObject({
      id: rawTrip.id,
      tripCode: "LOCALRIDE1001",
      status: "IN_TRANSIT",
      vehicleType: "AUTO_THREE_WHEELER",
      distanceMeters: 5100,
      durationSeconds: 1080,
      fare: 185,
      currency: "INR",
      customer: { id: rawTrip.customerId, name: "Jaipur Passenger" },
      driver: { id: rawTrip.driverId, name: "Meera Singh" },
    });
    expect(trip.pickup).toEqual({ address: "Bani Park, Jaipur, Rajasthan", latitude: 26.9321, longitude: 75.7932 });
    expect(trip.destination).toEqual({
      address: "Hawa Mahal, Jaipur, Rajasthan",
      latitude: 26.9239,
      longitude: 75.8267,
    });
  });

  it("rejects coordinates outside geographic bounds", () => {
    expect(validLocation({ address: "Broken", latitude: 91, longitude: 75 })).toBe(false);
    expect(validLocation({ address: "Valid", latitude: -90, longitude: 180 })).toBe(true);
  });

  it("creates a curved 25-position fallback preserving exact endpoints", () => {
    const trip = normaliseTrip(rawTrip);
    const route = curvedFallbackRoute(trip.pickup, trip.destination);

    expect(route.positions).toHaveLength(25);
    expect(route.positions[0]).toEqual([26.9321, 75.7932]);
    expect(route.positions.at(-1)).toEqual([26.9239, 75.8267]);
    expect(route.approximate).toBe(true);
  });

  it("prefers a routed line and computes route bounds", () => {
    const trip = normaliseTrip(rawTrip);
    const routed = {
      positions: [
        [26.9321, 75.7932],
        [26.9239, 75.8267],
      ] as [number, number][],
      approximate: false,
    };

    expect(routeForDisplay(trip, routed)).toBe(routed);
    expect(tripRouteBounds(routed.positions)).toEqual([
      [26.9239, 75.7932],
      [26.9321, 75.8267],
    ]);
  });

  it("formats operational metrics and inspector text", () => {
    expect(formatDistance(5100)).toBe("5.1 km");
    expect(formatDuration(1080)).toBe("18 min");
    expect(locationInspectorText(normaliseTrip(rawTrip).pickup, "Pickup")).toEqual({
      label: "Pickup",
      address: "Bani Park, Jaipur, Rajasthan",
      coordinates: "26.932100, 75.793200",
    });
  });
});
