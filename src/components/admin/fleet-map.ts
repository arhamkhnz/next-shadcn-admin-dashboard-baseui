export type FleetLocation = {
  latitude: number;
  longitude: number;
  accuracyM: number;
  speedMps: number | null;
  speedSource: string;
  bearingDeg: number | null;
  batteryPercent: number | null;
  networkType: string | null;
  capturedAt: string;
  receivedAt: string;
  freshness: string;
};

export type FleetRider = {
  riderId: string;
  name: string;
  maskedMobile: string;
  vehicle: { type: string; registrationNumber: string };
  state: string;
  zoneId: string | null;
  location: FleetLocation | null;
  trail: { latitude: number; longitude: number; capturedAt: string }[];
  activeWork: { kind?: string; id?: string; state?: string } | null;
  safety: { incidentId: string; status: string; reasonCode: string } | null;
};

export const ONLINE_STATES = new Set(["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY", "RETURNING"]);

export type FleetMarkerKind = "online" | "offline" | "safety";

export function classifyFleetRider(rider: FleetRider): FleetMarkerKind {
  if (rider.safety) return "safety";
  return ONLINE_STATES.has(rider.state) ? "online" : "offline";
}

export function fleetRidersWithLocations(riders: FleetRider[]): (FleetRider & { location: FleetLocation })[] {
  return riders.filter((rider): rider is FleetRider & { location: FleetLocation } => {
    const location = rider.location;
    return Boolean(
      location &&
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude) &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180,
    );
  });
}

export function fleetBounds(riders: FleetRider[]): [[number, number], [number, number]] | undefined {
  const located = fleetRidersWithLocations(riders);
  if (located.length === 0) return undefined;
  const latitudes = located.map((rider) => rider.location.latitude);
  const longitudes = located.map((rider) => rider.location.longitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export function findFleetRiderForTrip(
  riders: FleetRider[],
  trip: { id: string; driverId?: string },
): FleetRider | undefined {
  return riders.find(
    (rider) =>
      rider.riderId === trip.driverId ||
      (rider.activeWork?.kind === "PASSENGER_RIDE" && rider.activeWork.id === trip.id),
  );
}

export function findFleetRiderForOrder(
  riders: FleetRider[],
  order: { id: string; riderId?: string },
): FleetRider | undefined {
  return riders.find(
    (rider) =>
      rider.riderId === order.riderId ||
      (rider.activeWork?.kind === "DELIVERY_ORDER" && rider.activeWork.id === order.id),
  );
}
