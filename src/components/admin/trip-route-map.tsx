"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { Clock3, LocateFixed, MapPin } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { OperationalRouteSubject } from "./order-types";
import { locationInspectorText, routeForDisplay, tripRouteBounds, validLocation } from "./trip-route";
import type { AdminTrip, LocationInspector, TripDriverLocation, TripLocation, TripRoute } from "./trip-types";

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const routeFetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new Error("Road route unavailable");
    return (await response.json()) as TripRoute;
  });

function routeEndpoint(subject: OperationalRouteSubject): string | null {
  if (!validLocation(subject.pickup) || !validLocation(subject.destination)) return null;
  const params = new URLSearchParams({
    pickupLat: String(subject.pickup.latitude),
    pickupLng: String(subject.pickup.longitude),
    destinationLat: String(subject.destination.latitude),
    destinationLng: String(subject.destination.longitude),
  });
  return `/api/maps/route?${params}`;
}

export function OperationalRouteMap({
  subject,
  driverLocation,
  compact = false,
}: {
  subject: OperationalRouteSubject;
  driverLocation?: TripDriverLocation;
  compact?: boolean;
}) {
  const endpoint = routeEndpoint(subject);
  const { data: routed } = useSWR<TripRoute>(endpoint, routeFetcher, {
    keepPreviousData: false,
    revalidateOnFocus: false,
  });
  const route = useMemo(() => routeForDisplay(subject, routed), [subject, routed]);
  const [selected, setSelected] = useState<LocationInspector>(() => locationInspectorText(subject.pickup, "Pickup"));
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => setSelected(locationInspectorText(subject.pickup, "Pickup")), [subject]);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapNode.current || mapRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(mapNode.current, { zoomControl: !compact, preferCanvas: true, attributionControl: true });
      leaflet
        .tileLayer(process.env.NEXT_PUBLIC_OSM_TILE_URL ?? DEFAULT_TILE_URL, {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
        })
        .addTo(map);
      layerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      layerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready) return;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: the map ref is populated by a separate async effect.
    if (!map) return;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: the marker layer ref is populated by a separate async effect.
    if (!layer) return;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: the Leaflet module ref is populated by a separate async effect.
    if (!leaflet) return;
    const leafletApi = leaflet;
    const markerLayer = layer;
    layer.clearLayers();

    function marker(point: TripLocation, label: string, color: string) {
      if (!validLocation(point)) return;
      const item = leafletApi.circleMarker([point.latitude, point.longitude], {
        radius: compact ? 7 : 9,
        color: "#ffffff",
        weight: 3,
        fillColor: color,
        fillOpacity: 1,
      });
      const tooltip = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = label;
      const address = document.createElement("div");
      address.textContent = point.address;
      const coordinates = document.createElement("div");
      coordinates.textContent = `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
      tooltip.append(title, address, coordinates);
      item.bindTooltip(tooltip, { direction: "top", offset: [0, -8] });
      item.on("click", () => setSelected(locationInspectorText(point, label)));
      item.addTo(markerLayer);
    }

    if (route.positions.length >= 2) {
      leaflet.polyline(route.positions, { color: "#ffffff", weight: compact ? 7 : 10, opacity: 0.92 }).addTo(layer);
      leaflet
        .polyline(route.positions, { color: "#2563eb", weight: compact ? 4 : 5, opacity: 0.95, smoothFactor: 1.25 })
        .addTo(layer);
    }
    marker(subject.pickup, "Pickup", "#16a34a");
    marker(subject.destination, "Destination", "#dc2626");

    if (driverLocation) {
      const driverPoint: TripLocation = {
        address: driverLocation.online ? "Current online driver location" : "Last recorded offline driver location",
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      };
      if (validLocation(driverPoint)) {
        const driverMarker = leaflet.circleMarker([driverPoint.latitude, driverPoint.longitude], {
          radius: compact ? 7 : 9,
          color: "#ffffff",
          weight: 3,
          fillColor: driverLocation.online ? "#2563eb" : "#64748b",
          fillOpacity: 1,
        });
        const tooltip = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = driverLocation.name;
        const state = document.createElement("div");
        state.textContent = driverPoint.address;
        tooltip.append(name, state);
        driverMarker.bindTooltip(tooltip, { direction: "top", offset: [0, -8] });
        driverMarker.on("click", () =>
          setSelected(
            locationInspectorText(
              driverPoint,
              driverLocation.name,
              driverLocation.capturedAt
                ? `Updated ${new Date(driverLocation.capturedAt).toLocaleString("en-IN")}`
                : undefined,
            ),
          ),
        );
        driverMarker.addTo(layer);
      }
    }

    const driverPointIsValid = Boolean(
      driverLocation &&
        validLocation({
          address: "Driver",
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        }),
    );
    const positions =
      driverLocation && driverPointIsValid
        ? [...route.positions, [driverLocation.latitude, driverLocation.longitude] as [number, number]]
        : route.positions;
    const bounds = tripRouteBounds(positions);
    if (bounds)
      map.fitBounds(bounds, { padding: compact ? [22, 22] : [46, 46], maxZoom: compact ? 13 : 15, animate: false });
    else map.setView([26.9124, 75.7873], 11, { animate: false });
    window.setTimeout(() => map.invalidateSize(), 0);
  }, [compact, driverLocation, ready, route, subject]);

  const pickupInspector = locationInspectorText(subject.pickup, "Pickup");
  const destinationInspector = locationInspectorText(subject.destination, "Destination");

  return (
    <section className="space-y-3" aria-label={`Route map for ${subject.label}`}>
      <div className="relative overflow-hidden rounded-xl border bg-muted">
        <div
          ref={mapNode}
          role="img"
          className={cn(compact ? "h-52" : "h-[52vh] min-h-[380px]", "w-full")}
          aria-label={`${subject.pickup.address} to ${subject.destination.address}`}
        />
        {!ready ? (
          <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground text-sm">
            Loading map…
          </div>
        ) : null}
        <div className="pointer-events-none absolute top-3 left-3 rounded-full border bg-background/95 px-2.5 py-1 font-medium text-xs shadow-sm backdrop-blur">
          {route.approximate ? "Approximate route" : "Road route"}
        </div>
      </div>
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-3")}>
        <LocationButton icon={<MapPin />} inspector={pickupInspector} onSelect={setSelected} />
        <LocationButton icon={<LocateFixed />} inspector={destinationInspector} onSelect={setSelected} />
        {driverLocation ? (
          <LocationButton
            icon={<Clock3 />}
            inspector={{
              label: driverLocation.name,
              address: driverLocation.online
                ? "Current online driver location"
                : "Last recorded offline driver location",
              coordinates: `${driverLocation.latitude.toFixed(6)}, ${driverLocation.longitude.toFixed(6)}`,
              meta: driverLocation.capturedAt
                ? `Updated ${new Date(driverLocation.capturedAt).toLocaleString("en-IN")}`
                : undefined,
            }}
            onSelect={setSelected}
          />
        ) : null}
      </div>
      <div className="rounded-lg border bg-muted/35 p-3" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-sm">{selected.label}</p>
          <code className="font-mono text-muted-foreground text-xs">{selected.coordinates}</code>
        </div>
        <p className="mt-1 text-sm">{selected.address}</p>
        {selected.meta ? <p className="mt-1 text-muted-foreground text-xs">{selected.meta}</p> : null}
      </div>
    </section>
  );
}

export function TripRouteMap({
  trip,
  driverLocation,
  compact = false,
}: {
  trip: AdminTrip;
  driverLocation?: TripDriverLocation;
  compact?: boolean;
}) {
  return (
    <OperationalRouteMap
      subject={{
        id: trip.id,
        label: trip.tripCode,
        pickup: trip.pickup,
        destination: trip.destination,
      }}
      driverLocation={driverLocation}
      compact={compact}
    />
  );
}

function LocationButton({
  icon,
  inspector,
  onSelect,
}: {
  icon: React.ReactNode;
  inspector: LocationInspector;
  onSelect: (value: LocationInspector) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-auto min-w-0 justify-start px-3 py-2 text-left"
      onClick={() => onSelect(inspector)}
    >
      <span className="shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span className="min-w-0">
        <span className="block font-medium text-xs">{inspector.label}</span>
        <span className="block truncate text-muted-foreground text-xs">{inspector.address}</span>
      </span>
    </Button>
  );
}
