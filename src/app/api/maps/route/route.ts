import { type NextRequest, NextResponse } from "next/server";

import type { TripLocation } from "@/components/admin/trip-types";
import { readAdminTokens } from "@/lib/auth/cookies";
import { buildOsrmRouteUrl, parseOsrmRoute, readBoundedJson } from "@/lib/maps/open-route";

const DEFAULT_ROUTE_SERVER = "https://router.project-osrm.org";

function coordinate(request: NextRequest, name: string): number | undefined {
  const raw = request.nextUrl.searchParams.get(name);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function requestedLocation(request: NextRequest, prefix: "pickup" | "destination"): TripLocation | null {
  const latitude = coordinate(request, `${prefix}Lat`);
  const longitude = coordinate(request, `${prefix}Lng`);
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  )
    return null;
  return { address: prefix === "pickup" ? "Pickup" : "Destination", latitude, longitude };
}

export async function GET(request: NextRequest) {
  const tokens = readAdminTokens(request);
  if (!tokens.accessToken || !tokens.refreshToken) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }

  const pickup = requestedLocation(request, "pickup");
  const destination = requestedLocation(request, "destination");
  if (!pickup || !destination) {
    return NextResponse.json({ message: "Valid pickup and destination coordinates are required." }, { status: 400 });
  }

  try {
    const url = buildOsrmRouteUrl(process.env.OPEN_ROUTE_BASE_URL ?? DEFAULT_ROUTE_SERVER, pickup, destination);
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "LiftNGo-Admin/1.0" },
      signal: AbortSignal.timeout(4500),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Route server rejected the request.");
    const route = parseOsrmRoute(await readBoundedJson(response));
    if (!route) throw new Error("Route server returned invalid geometry.");
    return NextResponse.json(route, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return NextResponse.json({ message: "A road route is unavailable right now." }, { status: 502 });
  }
}
