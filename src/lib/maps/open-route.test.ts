import { describe, expect, it } from "vitest";

import { buildOsrmRouteUrl, parseOsrmRoute } from "./open-route";

describe("open route boundary", () => {
  it("builds a fixed OSRM driving URL in longitude-latitude order", () => {
    expect(
      buildOsrmRouteUrl(
        "https://router.project-osrm.org",
        { address: "Bani Park", latitude: 26.9321, longitude: 75.7932 },
        { address: "Hawa Mahal", latitude: 26.9239, longitude: 75.8267 },
      ).toString(),
    ).toBe(
      "https://router.project-osrm.org/route/v1/driving/75.7932,26.9321;75.8267,26.9239?overview=full&geometries=geojson&steps=false",
    );
  });

  it("converts OSRM GeoJSON positions into Leaflet latitude-longitude positions", () => {
    expect(
      parseOsrmRoute({
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
          },
        ],
      }),
    ).toEqual({
      positions: [
        [26.9321, 75.7932],
        [26.9239, 75.8267],
      ],
      distanceMeters: 5212.4,
      durationSeconds: 1062.8,
      approximate: false,
    });
  });

  it("rejects malformed route geometry", () => {
    expect(parseOsrmRoute({ code: "Ok", routes: [{ geometry: { coordinates: [[500, 26]] } }] })).toBeNull();
  });
});
