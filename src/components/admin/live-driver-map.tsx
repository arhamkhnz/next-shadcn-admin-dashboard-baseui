"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { BatteryMedium, Clock3, LocateFixed, MapPin, Navigation, Signal, Users } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { displayValue } from "@/lib/display";

import { ExportRecordsButton } from "./export-records-button";
import {
  classifyFleetRider,
  type FleetMarkerKind,
  type FleetRider,
  fleetBounds,
  fleetRidersWithLocations,
  ONLINE_STATES,
} from "./fleet-map";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

type FleetSnapshot = { riders: FleetRider[]; serverTime: string; sequence: number };

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MARKER_COLORS: Record<FleetMarkerKind, string> = {
  online: "#16a34a",
  offline: "#64748b",
  safety: "#dc2626",
};
const EMPTY_RIDERS: FleetRider[] = [];

function locationLabel(rider?: FleetRider): string {
  if (!rider?.location) return "No location has been shared";
  if (ONLINE_STATES.has(rider.state)) return "Current online location";
  return "Last recorded offline location";
}

function markerLabel(kind: FleetMarkerKind): string {
  if (kind === "online") return "Current online location";
  if (kind === "safety") return "Active safety alert";
  return "Last offline location";
}

export function LiveDriverMap() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<FleetSnapshot>(
    "/api/backend/operations/platform/fleet?limit=500",
    fetcher,
    { refreshInterval: 10_000, keepPreviousData: true, revalidateOnFocus: true },
  );
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>();
  const [mapReady, setMapReady] = useState(false);
  const mapNode = useRef<HTMLElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const lastFitKey = useRef("");
  const tileUrl = process.env.NEXT_PUBLIC_OSM_TILE_URL ?? DEFAULT_TILE_URL;
  const allRiders = data?.riders ?? EMPTY_RIDERS;
  const riders = useMemo(
    () =>
      allRiders.filter((rider) => {
        if (filter === "online") return ONLINE_STATES.has(rider.state);
        if (filter === "offline") return !ONLINE_STATES.has(rider.state);
        if (filter === "stale") return rider.location?.freshness === "STALE" || !rider.location;
        return true;
      }),
    [allRiders, filter],
  );
  const selected = allRiders.find((rider) => rider.riderId === selectedId) ?? riders[0];
  const onlineCount = allRiders.filter((rider) => ONLINE_STATES.has(rider.state)).length;
  const locatedCount = fleetRidersWithLocations(allRiders).length;
  const exportRows = riders.map((rider) => ({
    riderId: rider.riderId,
    name: rider.name,
    state: rider.state,
    maskedMobile: rider.maskedMobile,
    vehicleType: rider.vehicle.type,
    vehicleRegistration: rider.vehicle.registrationNumber,
    zoneId: rider.zoneId,
    latitude: rider.location?.latitude,
    longitude: rider.location?.longitude,
    capturedAt: rider.location?.capturedAt,
    freshness: rider.location?.freshness,
    accuracyM: rider.location?.accuracyM,
    batteryPercent: rider.location?.batteryPercent,
    activeWork: rider.activeWork
      ? `${rider.activeWork.kind ?? "Work"} · ${rider.activeWork.state ?? "Active"}`
      : "None",
  }));
  const exportColumns = [
    "riderId",
    "name",
    "state",
    "maskedMobile",
    "vehicleType",
    "vehicleRegistration",
    "zoneId",
    "latitude",
    "longitude",
    "capturedAt",
    "freshness",
    "accuracyM",
    "batteryPercent",
    "activeWork",
  ];

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapNode.current || mapRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet
        .map(mapNode.current, { zoomControl: true, preferCanvas: true })
        .setView([26.9124, 75.7873], 11);
      leaflet
        .tileLayer(tileUrl, {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
        })
        .addTo(map);
      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      markerLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [tileUrl]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: Leaflet refs are populated asynchronously before mapReady settles.
    if (!leaflet || !map || !layer || !mapReady) return;
    layer.clearLayers();
    const located = fleetRidersWithLocations(riders);
    for (const rider of located) {
      const kind = classifyFleetRider(rider);
      const marker = leaflet.circleMarker([rider.location.latitude, rider.location.longitude], {
        radius: rider.riderId === selected?.riderId ? 10 : 8,
        color: "#ffffff",
        weight: rider.riderId === selected?.riderId ? 4 : 2,
        fillColor: MARKER_COLORS[kind],
        fillOpacity: 1,
      });
      const tooltip = document.createElement("div");
      tooltip.className = "space-y-0.5";
      const name = document.createElement("strong");
      name.textContent = rider.name;
      const state = document.createElement("div");
      state.textContent = markerLabel(kind);
      tooltip.append(name, state);
      marker.bindTooltip(tooltip, { direction: "top", offset: [0, -8] });
      marker.on("click", () => setSelectedId(rider.riderId));
      marker.addTo(layer);
    }

    const fitKey = `${filter}:${located.map((rider) => rider.riderId).join(",")}`;
    const bounds = fleetBounds(located);
    if (bounds && fitKey !== lastFitKey.current) {
      if (located.length === 1) map.setView(bounds[0], 14);
      else map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      lastFitKey.current = fitKey;
    }
  }, [filter, mapReady, riders, selected?.riderId]);

  function selectRider(rider: FleetRider) {
    setSelectedId(rider.riderId);
    if (rider.location)
      mapRef.current?.flyTo([rider.location.latitude, rider.location.longitude], 14, { duration: 0.5 });
  }

  return (
    <main className="min-w-0 space-y-5">
      <PageHeader
        title="Live driver map"
        description="OpenStreetMap view of current online positions and the most recently recorded location for offline drivers."
        action={
          <Button variant="outline" onClick={() => mutate()} disabled={isValidating}>
            <LocateFixed className={isValidating ? "animate-spin" : ""} />
            {isValidating ? "Refreshing…" : "Refresh now"}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Drivers" value={allRiders.length} icon={<Users />} />
        <Metric label="Online now" value={onlineCount} icon={<LocateFixed />} />
        <Metric label="Locations available" value={locatedCount} icon={<MapPin />} />
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-full overflow-x-auto pb-1">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="min-w-max">
              <TabsTrigger value="all">All ({allRiders.length})</TabsTrigger>
              <TabsTrigger value="online">Online ({onlineCount})</TabsTrigger>
              <TabsTrigger value="offline">Offline ({allRiders.length - onlineCount})</TabsTrigger>
              <TabsTrigger value="stale">Stale/no location</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ExportRecordsButton rows={exportRows} columns={exportColumns} filename="live-driver-map" />
          <p className="text-muted-foreground text-xs">Green: online · Grey: offline · Red: safety alert</p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Fleet feed unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error.message}</span>
            <Button size="sm" variant="outline" onClick={() => mutate()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section
          ref={mapNode}
          className="h-[55vh] min-h-[420px] overflow-hidden rounded-xl border bg-muted xl:h-[680px]"
          aria-label="Live and last-known LiftNGo driver locations"
        >
          {!mapReady ? <div className="grid h-full place-items-center text-muted-foreground">Loading map…</div> : null}
        </section>

        <Card className="min-h-0 xl:h-[680px]">
          <CardHeader>
            <CardTitle>{isLoading ? "Loading drivers…" : (selected?.name ?? "No matching drivers")}</CardTitle>
            <CardDescription>{locationLabel(selected)}</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col gap-4">
            {selected ? <DriverLocationDetails rider={selected} /> : null}
            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-sm">Matching drivers</p>
                <span className="text-muted-foreground text-xs">{riders.length}</span>
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1 xl:max-h-80">
                {riders.map((rider) => (
                  <button
                    type="button"
                    key={rider.riderId}
                    onClick={() => selectRider(rider)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-current={selected?.riderId === rider.riderId ? "true" : undefined}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-sm">{rider.name}</span>
                      <span className="block truncate text-muted-foreground text-xs">
                        {rider.vehicle.registrationNumber} ·{" "}
                        {rider.location ? displayValue(rider.location.capturedAt) : "No location"}
                      </span>
                    </span>
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: MARKER_COLORS[classifyFleetRider(rider)] }}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{classifyFleetRider(rider)}</span>
                  </button>
                ))}
                {!isLoading && riders.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-sm">
                    No drivers match this filter.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 font-semibold text-2xl tabular-nums">{value}</p>
        </div>
        <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>
      </CardContent>
    </Card>
  );
}

function DriverLocationDetails({ rider }: { rider: FleetRider }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge value={rider.state} />
        <Badge variant="outline">{rider.vehicle.type.replaceAll("_", " ")}</Badge>
        {rider.safety ? <Badge variant="destructive">SOS: {rider.safety.reasonCode}</Badge> : null}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Mobile</dt>
        <dd>{rider.maskedMobile}</dd>
        <dt className="text-muted-foreground">Vehicle</dt>
        <dd>{rider.vehicle.registrationNumber}</dd>
        <dt className="text-muted-foreground">Zone</dt>
        <dd>{rider.zoneId ?? "Unassigned"}</dd>
        <dt className="text-muted-foreground">Active work</dt>
        <dd>
          {rider.activeWork ? `${rider.activeWork.kind ?? "Work"} · ${rider.activeWork.state ?? "Active"}` : "None"}
        </dd>
      </dl>
      {rider.location ? (
        <div className="space-y-2 rounded-lg border p-3 text-sm">
          <p className="font-mono text-xs">
            {rider.location.latitude.toFixed(6)}, {rider.location.longitude.toFixed(6)}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="size-4" />
            {displayValue(rider.location.capturedAt)}
          </p>
          <p className="flex items-center gap-2">
            <Navigation className="size-4" />
            {rider.location.speedMps == null
              ? "Speed unavailable"
              : `${(rider.location.speedMps * 3.6).toFixed(1)} km/h · ${rider.location.speedSource.toLowerCase()}`}
          </p>
          <p className="flex items-center gap-2">
            <BatteryMedium className="size-4" />
            {rider.location.batteryPercent ?? "—"}% battery
          </p>
          <p className="flex items-center gap-2">
            <Signal className="size-4" />
            {rider.location.networkType ?? "Unknown network"} · ±{rider.location.accuracyM} m ·{" "}
            {rider.location.freshness.toLowerCase()}
          </p>
        </div>
      ) : (
        <Alert>
          <AlertTitle>No location received</AlertTitle>
          <AlertDescription>
            This driver remains listed and will appear on the map after the first location sample.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
