import { NextRequest } from "next/server";

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const query = "pickupLat=26.9321&pickupLng=75.7932&destinationLat=26.9239&destinationLng=75.8267";

function request(search = query, authenticated = true) {
  return new NextRequest(`http://localhost/api/maps/route?${search}`, {
    headers: authenticated
      ? { cookie: "liftngo_admin_access=access-token; liftngo_admin_refresh=refresh-token" }
      : undefined,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/maps/route", () => {
  it("requires an authenticated admin session", async () => {
    const response = await GET(request(query, false));
    expect(response.status).toBe(401);
  });

  it("rejects invalid coordinate input before routing", async () => {
    const response = await GET(request(query.replace("pickupLat=26.9321", "pickupLat=999")));
    expect(response.status).toBe(400);
  });

  it("returns a validated route without exposing upstream metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "Ok",
            routes: [
              {
                distance: 5212.4,
                duration: 1062.8,
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [75.7932, 26.9321],
                    [75.8267, 26.9239],
                  ],
                },
                legs: [{ secret: "not-for-browser" }],
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      positions: [
        [26.9321, 75.7932],
        [26.9239, 75.8267],
      ],
      distanceMeters: 5212.4,
      durationSeconds: 1062.8,
      approximate: false,
    });
  });

  it("returns a stable safe message when routing fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("upstream stack trace", { status: 500 })));
    const response = await GET(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: "A road route is unavailable right now." });
  });
});
