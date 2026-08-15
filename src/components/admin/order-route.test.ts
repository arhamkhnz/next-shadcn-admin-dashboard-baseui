import { describe, expect, it } from "vitest";

import { formatPaise, normaliseOrder, orderAsRouteSubject } from "./order-route";

describe("delivery order route helpers", () => {
  it("normalises the platform order fields used by the map workspace", () => {
    const order = normaliseOrder({
      id: "order-1",
      partnerReference: "FOOD-1001",
      state: "EN_ROUTE_DROP",
      riderId: "rider-1",
      partnerId: "partner-1",
      pickupAddress: "MI Road, Jaipur",
      pickupLatitude: 26.915,
      pickupLongitude: 75.812,
      pickupContactName: "Outlet counter",
      pickupContactMobile: "9876543210",
      dropAddress: "Bani Park, Jaipur",
      dropLatitude: 26.932,
      dropLongitude: 75.793,
      dropContactName: "Asha",
      dropContactMobile: "9123456780",
      deliveryDistanceM: 4300,
      itemSummary: "2 food packages",
      declaredValuePaise: 125000,
      promisedAt: "2026-08-15T14:00:00.000Z",
      pricingSnapshot: { customerQuote: { totalPaise: 4900 } },
      updatedAt: "2026-08-15T13:10:00.000Z",
    });

    expect(order).toMatchObject({
      id: "order-1",
      reference: "FOOD-1001",
      state: "EN_ROUTE_DROP",
      riderId: "rider-1",
      partnerId: "partner-1",
      pickup: { address: "MI Road, Jaipur", latitude: 26.915, longitude: 75.812 },
      drop: { address: "Bani Park, Jaipur", latitude: 26.932, longitude: 75.793 },
      distanceMeters: 4300,
      customerFeePaise: 4900,
      declaredValuePaise: 125000,
      itemSummary: "2 food packages",
    });
    expect(order.pickupContact.name).toBe("Outlet counter");
    expect(order.dropContact.mobile).toBe("9123456780");
  });

  it("supports API aliases and produces a reusable route subject", () => {
    const order = normaliseOrder({
      id: "order-2",
      externalOrderId: "EXT-2002",
      status: "CREATED",
      pickup: { address: "Pickup", latitude: 26.9, longitude: 75.8 },
      destination: { address: "Drop", latitude: 27, longitude: 75.9 },
      customerFeePaise: 3900,
    });

    expect(order.reference).toBe("EXT-2002");
    expect(order.state).toBe("CREATED");
    expect(orderAsRouteSubject(order)).toEqual({
      id: "order-2",
      label: "EXT-2002",
      pickup: order.pickup,
      destination: order.drop,
    });
  });

  it("formats paise without treating missing values as zero", () => {
    expect(formatPaise(4900)).toBe("₹49.00");
    expect(formatPaise(undefined)).toBe("Not available");
  });
});
