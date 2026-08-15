import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderPreview } from "./order-preview";
import { normaliseOrder } from "./order-route";

vi.mock("./trip-route-map", () => ({
  OperationalRouteMap: ({ subject }: { subject: { label: string } }) => (
    <div role="img" aria-label={`Map for ${subject.label}`} />
  ),
}));

describe("OrderPreview", () => {
  it("shows the delivery route and operational summary", () => {
    const order = normaliseOrder({
      id: "order-1",
      partnerReference: "FOOD-1001",
      state: "EN_ROUTE_DROP",
      pickupAddress: "MI Road",
      pickupLatitude: 26.915,
      pickupLongitude: 75.812,
      dropAddress: "Bani Park",
      dropLatitude: 26.932,
      dropLongitude: 75.793,
      deliveryDistanceM: 4300,
      customerFeePaise: 4900,
      declaredValuePaise: 125000,
      itemSummary: "2 food packages",
    });

    render(<OrderPreview order={order} />);

    expect(screen.getByRole("heading", { name: "FOOD-1001 route preview" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Map for FOOD-1001" })).toBeInTheDocument();
    expect(screen.getByText("MI Road")).toBeInTheDocument();
    expect(screen.getByText("Bani Park")).toBeInTheDocument();
    expect(screen.getByText("₹49.00")).toBeInTheDocument();
    expect(screen.getByText("₹1,250.00")).toBeInTheDocument();
    expect(screen.getByText("2 food packages")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View full order details" })).toHaveAttribute(
      "href",
      "/dashboard/orders/order-1",
    );
  });
});
