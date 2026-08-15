import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrderWorkspace } from "./order-workspace";

vi.mock("./trip-route-map", () => ({
  OperationalRouteMap: ({ subject }: { subject: { label: string } }) => (
    <div role="img" aria-label={`Map for ${subject.label}`} />
  ),
}));

const orders = [
  {
    id: "order-1",
    partnerReference: "FOOD-1001",
    state: "READY_FOR_ASSIGNMENT",
    pickupAddress: "MI Road",
    pickupLatitude: 26.915,
    pickupLongitude: 75.812,
    dropAddress: "Bani Park",
    dropLatitude: 26.932,
    dropLongitude: 75.793,
    deliveryDistanceM: 4300,
  },
  {
    id: "order-2",
    partnerReference: "FOOD-1002",
    state: "ARRIVED_PICKUP",
    pickupAddress: "C-Scheme",
    pickupLatitude: 26.91,
    pickupLongitude: 75.8,
    dropAddress: "Malviya Nagar",
    dropLatitude: 26.85,
    dropLongitude: 75.81,
    deliveryDistanceM: 6200,
  },
];

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("OrderWorkspace", () => {
  it("updates the persistent preview after deliberate row hover", () => {
    vi.useFakeTimers();
    render(<OrderWorkspace rows={orders} />);

    expect(screen.getByRole("heading", { name: "FOOD-1001 route preview" })).toBeInTheDocument();
    fireEvent.pointerEnter(screen.getByTestId("order-row-order-2"));
    expect(screen.queryByRole("heading", { name: "FOOD-1002 route preview" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole("heading", { name: "FOOD-1002 route preview" })).toBeInTheDocument();
  });

  it("updates on keyboard focus and exposes order-specific details", () => {
    render(<OrderWorkspace rows={orders} />);
    fireEvent.focus(screen.getByTestId("order-row-order-2"));

    expect(screen.getByRole("heading", { name: "FOOD-1002 route preview" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Actions for FOOD-1002" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "View full order details" })).toHaveAttribute(
      "href",
      "/dashboard/orders/order-2",
    );
  });

  it("opens the order preview in a mobile bottom sheet", async () => {
    render(<OrderWorkspace rows={orders} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview route for FOOD-1002" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "FOOD-1002 route preview" }).length).toBeGreaterThan(0);
  });

  it("keeps the map preview available in the saved grid layout", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/dashboard/orders");
    render(<OrderWorkspace rows={orders} />);

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    expect(screen.getByTestId("order-grid")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "FOOD-1001 route preview" })).toBeInTheDocument();
    expect(localStorage.getItem("liftngo:record-layout:/dashboard/orders")).toBe("grid");
  });

  it("offers CSV export for the filtered delivery order workspace", () => {
    render(<OrderWorkspace rows={orders} />);

    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });
});
