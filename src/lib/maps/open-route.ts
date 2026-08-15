import type { TripLocation, TripRoute } from "@/components/admin/trip-types";

const MAX_RESPONSE_BYTES = 1_000_000;

export function buildOsrmRouteUrl(baseUrl: string, pickup: TripLocation, destination: TripLocation): URL {
  const base = new URL(baseUrl);
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("Unsupported route server protocol.");
  const prefix = base.pathname.replace(/\/$/, "");
  base.pathname = `${prefix}/route/v1/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}`;
  base.search = new URLSearchParams({ overview: "full", geometries: "geojson", steps: "false" }).toString();
  return base;
}

export function parseOsrmRoute(value: unknown): TripRoute | null {
  if (!value || typeof value !== "object") return null;
  const response = value as { code?: unknown; routes?: unknown };
  if (response.code !== "Ok" || !Array.isArray(response.routes)) return null;
  const first = response.routes[0];
  if (!first || typeof first !== "object") return null;
  const route = first as { distance?: unknown; duration?: unknown; geometry?: unknown };
  if (!route.geometry || typeof route.geometry !== "object") return null;
  const geometry = route.geometry as { type?: unknown; coordinates?: unknown };
  if (geometry.type !== "LineString" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2)
    return null;
  const positions: [number, number][] = [];
  for (const coordinate of geometry.coordinates) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) return null;
    const longitude = Number(coordinate[0]);
    const latitude = Number(coordinate[1]);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    )
      return null;
    positions.push([latitude, longitude]);
  }
  const distanceMeters = Number(route.distance);
  const durationSeconds = Number(route.duration);
  return {
    positions,
    distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : undefined,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
    approximate: false,
  };
}

export async function readBoundedJson(response: Response): Promise<unknown> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES)
    throw new Error("Route response too large.");
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > MAX_RESPONSE_BYTES) throw new Error("Route response too large.");
  return JSON.parse(body);
}
