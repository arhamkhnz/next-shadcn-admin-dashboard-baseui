import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderDetailView } from "./order-detail";
import { normaliseOrder } from "./order-route";

vi.mock("./trip-route-map", () => ({
  OperationalRouteMap: ({ subject }: { subject: { label: string } }) => (
    <section aria-label={`Route map for ${subject.label}`}>Interactive route map</section>
  ),
}));

vi.mock("./action-console", () => ({
  ActionConsole: ({ title, fixedId }: { title: string; fixedId: string }) => (
    <section aria-label={`${title} for ${fixedId}`}>{title}</section>
  ),
}));

describe("OrderDetailView", () => {
  it("presents route, contacts, values, timeline, offers, and fixed-id actions", () => {
    const order = normaliseOrder({
      id: "order-1",
      partnerReference: "FOOD-1001",
      state: "ARRIVED_PICKUP",
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
      customerFeePaise: 4900,
      declaredValuePaise: 125000,
      itemSummary: "2 food packages",
      promisedAt: "2026-08-15T14:00:00.000Z",
      createdAt: "2026-08-15T13:00:00.000Z",
    });

    render(
      <OrderDetailView
        order={order}
        timeline={[
          {
            id: "transition-1",
            previousState: "READY_FOR_ASSIGNMENT",
            currentState: "ARRIVED_PICKUP",
            actorType: "RIDER",
            reasonCode: "ARRIVED",
            occurredAt: "2026-08-15T13:20:00.000Z",
          },
        ]}
        offers={[{ id: "offer-1", riderId: "rider-1", state: "ACCEPTED", offeredAt: "2026-08-15T13:05:00.000Z" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Order FOOD-1001" })).toBeInTheDocument();
    expect(screen.getByLabelText("Route map for FOOD-1001")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pickup and drop" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Order timeline" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Driver offers" })).toBeInTheDocument();
    expect(screen.getByText("Outlet counter")).toBeInTheDocument();
    expect(screen.getByText("Asha")).toBeInTheDocument();
    expect(screen.getAllByText("₹49.00").length).toBeGreaterThan(0);
    expect(screen.getByText("₹1,250.00")).toBeInTheDocument();
    expect(screen.getByLabelText("Manual driver offer for order-1")).toBeInTheDocument();
  });
});
