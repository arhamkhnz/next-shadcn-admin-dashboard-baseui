import type { AdminTrip, LocationInspector, TripLocation, TripPerson, TripRoute } from "./trip-types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const result = String(value).trim();
  return result || undefined;
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function timestamp(value: unknown): string | undefined {
  return text(value);
}

function person(value: unknown, fallbackId?: string): TripPerson | undefined {
  const source = record(value);
  const id = text(source.id) ?? fallbackId;
  const name = [text(source.firstName), text(source.lastName)].filter(Boolean).join(" ") || text(source.name);
  if (!id && !name) return undefined;
  return {
    id,
    name: name ?? "Not available",
    mobile: text(source.mobile) ?? text(source.maskedMobile),
    email: text(source.email),
  };
}

function location(source: Record<string, unknown>, nestedKey: string, prefix: string): TripLocation {
  const nested = record(source[nestedKey]);
  return {
    address: text(nested.address) ?? text(source[`${prefix}Address`]) ?? "Address unavailable",
    latitude: number(nested.latitude) ?? number(source[`${prefix}Latitude`]) ?? Number.NaN,
    longitude: number(nested.longitude) ?? number(source[`${prefix}Longitude`]) ?? Number.NaN,
  };
}

export function normaliseTrip(value: unknown): AdminTrip {
  const source = record(value);
  const customerId = text(source.customerId);
  const driverId = text(source.driverId);
  return {
    id: text(source.id) ?? "",
    tripCode: text(source.tripCode) ?? text(source.id) ?? "Trip",
    status: text(source.status) ?? "UNKNOWN",
    pickup: location(source, "origin", "origin"),
    destination: location(source, "destination", "destination"),
    customer: person(source.customer, customerId),
    driver: person(source.driver, driverId),
    customerId,
    driverId,
    vehicleType: text(source.vehicleType) ?? "Not assigned",
    vehicleSubType: text(source.vehicleSubType),
    distanceMeters: number(source.distanceMeters) ?? number(source.estimatedDistanceMeters),
    durationSeconds: number(source.durationSeconds) ?? number(source.estimatedDurationSeconds),
    fare: number(source.estimatedFare) ?? number(source.totalAmount),
    actualFare: number(source.actualFare),
    currency: text(source.currency) ?? "INR",
    bookingType: text(source.bookingType),
    paymentStatus: text(record(source.payment).status) ?? text(source.paymentStatus),
    businessName: text(source.businessName),
    receiverName: text(source.receiverName),
    receiverMobile: text(source.receiverMobile),
    cancellationReason: text(source.cancellationReason),
    cancellationReasonOther: text(source.cancellationReasonOther),
    cancelledBy: text(source.cancelledBy),
    createdAt: timestamp(source.createdAt),
    updatedAt: timestamp(source.updatedAt),
    scheduledAt: timestamp(source.scheduledAt),
    acceptedAt: timestamp(source.acceptedAt),
    driverArrivedAt: timestamp(source.driverArrivedAt),
    pickedUpAt: timestamp(source.pickedUpAt),
    deliveredAt: timestamp(source.deliveredAt),
    cancelledAt: timestamp(source.cancelledAt),
    raw: source,
  };
}

export function validLocation(value: TripLocation): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

export function curvedFallbackRoute(pickup: TripLocation, destination: TripLocation): TripRoute {
  if (!validLocation(pickup) || !validLocation(destination)) return { positions: [], approximate: true };
  const dx = destination.longitude - pickup.longitude;
  const dy = destination.latitude - pickup.latitude;
  const distance = Math.hypot(dx, dy);
  const controlLatitude =
    (pickup.latitude + destination.latitude) / 2 + (dx / Math.max(distance, 0.000001)) * distance * 0.18;
  const controlLongitude =
    (pickup.longitude + destination.longitude) / 2 - (dy / Math.max(distance, 0.000001)) * distance * 0.18;
  const positions: [number, number][] = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const inverse = 1 - t;
    return [
      inverse * inverse * pickup.latitude + 2 * inverse * t * controlLatitude + t * t * destination.latitude,
      inverse * inverse * pickup.longitude + 2 * inverse * t * controlLongitude + t * t * destination.longitude,
    ];
  });
  positions[0] = [pickup.latitude, pickup.longitude];
  positions[positions.length - 1] = [destination.latitude, destination.longitude];
  return { positions, approximate: true };
}

export function routeForDisplay(trip: Pick<AdminTrip, "pickup" | "destination">, route?: TripRoute | null): TripRoute {
  return route?.positions.length ? route : curvedFallbackRoute(trip.pickup, trip.destination);
}

export function tripRouteBounds(positions: [number, number][]): [[number, number], [number, number]] | undefined {
  if (!positions.length) return undefined;
  const latitudes = positions.map(([latitude]) => latitude);
  const longitudes = positions.map(([, longitude]) => longitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export function formatDistance(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "Not available";
  return value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(1)} km`;
}

export function formatDuration(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "Not available";
  const minutes = Math.round(value / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ${minutes % 60} min`;
}

export function locationInspectorText(locationValue: TripLocation, label: string, meta?: string): LocationInspector {
  return {
    label,
    address: locationValue.address,
    coordinates: `${locationValue.latitude.toFixed(6)}, ${locationValue.longitude.toFixed(6)}`,
    meta,
  };
}
