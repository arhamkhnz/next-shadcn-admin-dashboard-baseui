import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TripDetailView } from "./trip-detail";
import { normaliseTrip } from "./trip-route";

vi.mock("./trip-route-map", () => ({
  TripRouteMap: ({ trip }: { trip: { tripCode: string } }) => (
    <section aria-label={`Route map for ${trip.tripCode}`}>Interactive route map</section>
  ),
}));

describe("TripDetailView", () => {
  it("presents the full trip as readable operational sections without raw JSON", () => {
    const trip = normaliseTrip({
      id: "33333333-3333-4333-8333-333333333311",
      tripCode: "LOCALRIDE1001",
      status: "IN_TRANSIT",
      customerId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
      driverId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
      originAddress: "Bani Park, Jaipur",
      originLatitude: 26.9321,
      originLongitude: 75.7932,
      destinationAddress: "Hawa Mahal, Jaipur",
      destinationLatitude: 26.9239,
      destinationLongitude: 75.8267,
      distanceMeters: 5100,
      durationSeconds: 1080,
      estimatedFare: 185,
      currency: "INR",
      vehicleType: "AUTO_THREE_WHEELER",
      bookingType: "POSTPAID",
      createdAt: "2026-08-15T10:00:00.000Z",
      acceptedAt: "2026-08-15T10:04:00.000Z",
      pickedUpAt: "2026-08-15T10:12:00.000Z",
      customer: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
        firstName: "Jaipur",
        lastName: "Passenger",
        mobile: "9999999999",
      },
      driver: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
        firstName: "Meera",
        lastName: "Singh",
        mobile: "8888888888",
      },
    });

    const { container } = render(<TripDetailView trip={trip} />);

    expect(screen.getByRole("heading", { name: "Trip LOCALRIDE1001" })).toBeInTheDocument();
    expect(screen.getByLabelText("Route map for LOCALRIDE1001")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Route and live location" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trip timeline" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assigned driver" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fare and payment" })).toBeInTheDocument();
    expect(screen.getByText("Bani Park, Jaipur")).toBeInTheDocument();
    expect(screen.getByText("Hawa Mahal, Jaipur")).toBeInTheDocument();
    expect(screen.getByText("Jaipur Passenger")).toBeInTheDocument();
    expect(screen.getAllByText("Meera Singh").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('{"id":');
  });
});
