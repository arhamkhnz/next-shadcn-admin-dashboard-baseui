"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { BatteryMedium, Clock3, LocateFixed, MapPinOff, Navigation, Signal } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { displayValue } from "@/lib/display";

import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

type FleetLocation = {
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
type FleetRider = {
  riderId: string;
  name: string;
  maskedMobile: string;
  vehicle: { type: string; registrationNumber: string };
  state: string;
  zoneId: string | null;
  location: FleetLocation | null;
  activeWork: { kind?: string; id?: string; state?: string } | null;
  safety: { incidentId: string; status: string; reasonCode: string } | null;
};
type FleetSnapshot = { riders: FleetRider[]; serverTime: string; sequence: number };
const ONLINE_STATES = new Set(["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY", "RETURNING"]);
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });
let mapsPromise:
  | Promise<{
      GoogleMap: typeof google.maps.Map;
      AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
      PinElement: typeof google.maps.marker.PinElement;
    }>
  | undefined;

function loadMaps(key: string) {
  if (!mapsPromise) {
    setOptions({ key, v: "weekly" });
    mapsPromise = Promise.all([importLibrary("maps"), importLibrary("marker")]).then(([maps, marker]) => ({
      GoogleMap: maps.Map,
      AdvancedMarkerElement: marker.AdvancedMarkerElement,
      PinElement: marker.PinElement,
    }));
  }
  return mapsPromise;
}

export function LiveDriverMap() {
  const { data, error, isLoading, mutate } = useSWR<FleetSnapshot>(
    "/api/backend/operations/platform/fleet?limit=500",
    fetcher,
    { refreshInterval: 10_000, keepPreviousData: true },
  );
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>();
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? "";
  const riders = useMemo(
    () =>
      (data?.riders ?? []).filter((rider) => {
        if (filter === "online") return ONLINE_STATES.has(rider.state);
        if (filter === "offline") return !ONLINE_STATES.has(rider.state);
        if (filter === "stale") return rider.location?.freshness === "STALE" || !rider.location;
        return true;
      }),
    [data?.riders, filter],
  );
  const selected = data?.riders.find((rider) => rider.riderId === selectedId) ?? riders[0];

  useEffect(() => {
    if (!key || !mapNode.current || mapRef.current) return;
    loadMaps(key)
      .then(({ GoogleMap }) => {
        if (mapNode.current && !mapRef.current)
          mapRef.current = new GoogleMap(mapNode.current, {
            center: { lat: 26.9124, lng: 75.7873 },
            zoom: 12,
            mapId: "DEMO_MAP_ID",
            streetViewControl: false,
            mapTypeControl: false,
          });
      })
      .catch(() => undefined);
  }, [key]);

  useEffect(() => {
    if (!key || !mapRef.current) return;
    let cancelled = false;
    loadMaps(key)
      .then(({ AdvancedMarkerElement, PinElement }) => {
        if (cancelled || !mapRef.current) return;
        for (const marker of markersRef.current) marker.map = null;
        markersRef.current = riders.flatMap((rider) => {
          const location = rider.location;
          if (!location) return [];
          const online = ONLINE_STATES.has(rider.state);
          let markerColor = "#64748b";
          if (online) markerColor = "#16a34a";
          if (rider.safety) markerColor = "#dc2626";
          const pin = new PinElement({
            background: markerColor,
            borderColor: "#ffffff",
            glyphColor: "#ffffff",
          });
          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat: location.latitude, lng: location.longitude },
            title: `${rider.name} · ${online ? "Online" : "Last offline location"}`,
            content: pin.element,
          });
          marker.addListener("click", () => setSelectedId(rider.riderId));
          return [marker];
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [riders, key]);

  return (
    <main className="space-y-5">
      <PageHeader
        title="Live driver map"
        description="Current online positions and the most recently recorded location for offline drivers. Fleet data refreshes every 10 seconds."
        action={
          <Button variant="outline" onClick={() => mutate()}>
            <LocateFixed />
            Refresh now
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({data?.riders.length ?? 0})</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="stale">Stale/no location</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-muted-foreground text-xs">Green: online · Grey: offline · Red: safety alert</p>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Fleet feed unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}
      {!key ? (
        <Alert>
          <MapPinOff />
          <AlertTitle>Google Maps browser key required</AlertTitle>
          <AlertDescription>
            Set NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY in the admin environment. Driver data and last known locations are
            still listed below.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid min-h-[640px] gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div
          ref={mapNode}
          className="min-h-[520px] rounded-xl border bg-muted"
          role="application"
          aria-label="Live LiftNGo driver map"
        >
          {!key ? (
            <div className="grid h-full place-items-center text-muted-foreground">
              Map preview appears after the Google Maps key is configured.
            </div>
          ) : null}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isLoading ? "Loading drivers…" : (selected?.name ?? "No matching drivers")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={selected.state} />
                  <Badge variant="outline">{selected.vehicle.type}</Badge>
                  {selected.safety ? <Badge variant="destructive">SOS: {selected.safety.reasonCode}</Badge> : null}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Driver ID</dt>
                  <dd className="truncate font-mono text-xs">{selected.riderId}</dd>
                  <dt className="text-muted-foreground">Mobile</dt>
                  <dd>{selected.maskedMobile}</dd>
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd>{selected.vehicle.registrationNumber}</dd>
                  <dt className="text-muted-foreground">Zone</dt>
                  <dd>{selected.zoneId ?? "Unassigned"}</dd>
                  <dt className="text-muted-foreground">Active work</dt>
                  <dd>
                    {selected.activeWork
                      ? `${selected.activeWork.kind ?? "Work"} · ${selected.activeWork.state ?? "Active"}`
                      : "None"}
                  </dd>
                </dl>
                {selected.location ? (
                  <div className="space-y-3 rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {ONLINE_STATES.has(selected.state) ? "Current location" : "Last offline location"}
                    </p>
                    <p className="font-mono text-xs">
                      {selected.location.latitude.toFixed(6)}, {selected.location.longitude.toFixed(6)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock3 className="size-4" />
                      {displayValue(selected.location.capturedAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Navigation className="size-4" />
                      {selected.location.speedMps == null
                        ? "Speed unavailable"
                        : `${(selected.location.speedMps * 3.6).toFixed(1)} km/h (${selected.location.speedSource.toLowerCase()})`}
                    </p>
                    <p className="flex items-center gap-2">
                      <BatteryMedium className="size-4" />
                      {selected.location.batteryPercent ?? "—"}%
                    </p>
                    <p className="flex items-center gap-2">
                      <Signal className="size-4" />
                      {selected.location.networkType ?? "Unknown"} · ±{selected.location.accuracyM} m ·{" "}
                      {selected.location.freshness.toLowerCase()}
                    </p>
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No location received</AlertTitle>
                    <AlertDescription>This driver has not shared a location yet.</AlertDescription>
                  </Alert>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
