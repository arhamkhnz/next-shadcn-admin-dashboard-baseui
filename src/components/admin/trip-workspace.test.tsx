import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TripWorkspace } from "./trip-workspace";

vi.mock("./trip-route-map", () => ({
  TripRouteMap: ({ trip }: { trip: { tripCode: string } }) => (
    <div role="img" aria-label={`Map for ${trip.tripCode}`} />
  ),
}));

const trips = [
  {
    id: "trip-1",
    tripCode: "LOCALRIDE1001",
    status: "IN_TRANSIT",
    originAddress: "Bani Park",
    originLatitude: 26.9321,
    originLongitude: 75.7932,
    destinationAddress: "Hawa Mahal",
    destinationLatitude: 26.9239,
    destinationLongitude: 75.8267,
    estimatedFare: 185,
    currency: "INR",
  },
  {
    id: "trip-2",
    tripCode: "LOCALRIDE1002",
    status: "PENDING",
    originAddress: "Civil Lines",
    originLatitude: 26.91,
    originLongitude: 75.78,
    destinationAddress: "Jal Mahal",
    destinationLatitude: 26.95,
    destinationLongitude: 75.84,
    estimatedFare: 240,
    currency: "INR",
  },
];

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("TripWorkspace", () => {
  it("selects the first trip and updates the persistent preview after deliberate hover", () => {
    vi.useFakeTimers();
    render(<TripWorkspace rows={trips} />);

    expect(screen.getByRole("heading", { name: "LOCALRIDE1001 route preview" })).toBeInTheDocument();
    fireEvent.pointerEnter(screen.getByTestId("trip-row-trip-2"));
    expect(screen.queryByRole("heading", { name: "LOCALRIDE1002 route preview" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole("heading", { name: "LOCALRIDE1002 route preview" })).toBeInTheDocument();
  });

  it("updates immediately for keyboard focus and exposes full details", () => {
    render(<TripWorkspace rows={trips} />);
    fireEvent.focus(screen.getByTestId("trip-row-trip-2"));

    expect(screen.getByRole("heading", { name: "LOCALRIDE1002 route preview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View full trip details" })).toHaveAttribute(
      "href",
      "/dashboard/trips/trip-2",
    );
  });

  it("opens the same preview in a mobile bottom sheet", async () => {
    render(<TripWorkspace rows={trips} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview route for LOCALRIDE1002" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "LOCALRIDE1002 route preview" }).length).toBeGreaterThan(0);
  });

  it("supports a persistent grid without removing the route preview", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/dashboard/trips");
    render(<TripWorkspace rows={trips} />);

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    expect(screen.getByTestId("trip-grid")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LOCALRIDE1001 route preview" })).toBeInTheDocument();
    expect(localStorage.getItem("liftngo:record-layout:/dashboard/trips")).toBe("grid");
  });

  it("offers CSV export for the filtered trip workspace", () => {
    render(<TripWorkspace rows={trips} />);

    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });
});
