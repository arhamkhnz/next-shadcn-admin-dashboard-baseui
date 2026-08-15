"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Eye, MapPin, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { displayValue } from "@/lib/display";

import { ExportRecordsButton } from "./export-records-button";
import { LayoutToggle } from "./layout-toggle";
import { usePersistentLayout } from "./persistent-layout";
import { ResourceActions } from "./resource-actions";
import { StatusBadge } from "./status-badge";
import { formatFare, TripPreview } from "./trip-preview";
import { formatDistance, normaliseTrip } from "./trip-route";
import type { AdminTrip, TripDriverLocation } from "./trip-types";

export function TripWorkspace({
  rows,
  onRefresh,
  isRefreshing = false,
  driverLocations = {},
}: {
  rows: Record<string, unknown>[];
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
  driverLocations?: Record<string, TripDriverLocation>;
}) {
  const [layout, setLayout] = usePersistentLayout();
  const trips = useMemo(() => rows.map(normaliseTrip), [rows]);
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtered = useMemo(
    () =>
      deferredQuery
        ? trips.filter((trip) =>
            [
              trip.tripCode,
              trip.status,
              trip.pickup.address,
              trip.destination.address,
              trip.customer?.name,
              trip.driver?.name,
            ]
              .join(" ")
              .toLowerCase()
              .includes(deferredQuery),
          )
        : trips,
    [deferredQuery, trips],
  );
  const selected = trips.find((trip) => trip.id === selectedId) ?? filtered[0] ?? trips[0];
  const exportRows = filtered.map((trip) => ({
    tripCode: trip.tripCode,
    status: trip.status,
    pickupAddress: trip.pickup.address,
    pickupLatitude: trip.pickup.latitude,
    pickupLongitude: trip.pickup.longitude,
    destinationAddress: trip.destination.address,
    destinationLatitude: trip.destination.latitude,
    destinationLongitude: trip.destination.longitude,
    driver: trip.driver?.name ?? "Unassigned",
    customer: trip.customer?.name,
    fare: formatFare(trip.actualFare ?? trip.fare, trip.currency),
    createdAt: trip.createdAt,
  }));
  const exportColumns = [
    "tripCode",
    "status",
    "pickupAddress",
    "pickupLatitude",
    "pickupLongitude",
    "destinationAddress",
    "destinationLatitude",
    "destinationLongitude",
    "driver",
    "customer",
    "fare",
    "createdAt",
  ];

  useEffect(
    () => () => {
      clearTimeout(hoverTimer.current ?? undefined);
    },
    [],
  );

  function scheduleSelection(id: string) {
    clearTimeout(hoverTimer.current ?? undefined);
    hoverTimer.current = setTimeout(() => setSelectedId(id), 120);
  }

  function cancelSelection() {
    clearTimeout(hoverTimer.current ?? undefined);
    hoverTimer.current = null;
  }

  function openMobile(trip: AdminTrip) {
    setSelectedId(trip.id);
    setMobileOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search trips, routes, or people…"
            className="pl-9"
            aria-label="Search trips"
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <ExportRecordsButton rows={exportRows} columns={exportColumns} filename="customer-trips" />
          <LayoutToggle value={layout} onChange={setLayout} />
          {onRefresh ? (
            <Button size="sm" variant="outline" onClick={() => onRefresh()} disabled={isRefreshing}>
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
          ) : null}
        </div>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">No trips have been created yet.</CardContent>
        </Card>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          {layout === "list" ? (
            <Card className="hidden min-w-0 overflow-hidden lg:block">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Trip</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Driver</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Fare</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((trip) => (
                    <TableRow
                      key={trip.id}
                      data-testid={`trip-row-${trip.id}`}
                      tabIndex={0}
                      aria-selected={selected?.id === trip.id}
                      className="cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[selected=true]:bg-muted/70"
                      data-selected={selected?.id === trip.id}
                      onPointerEnter={() => scheduleSelection(trip.id)}
                      onPointerLeave={cancelSelection}
                      onFocus={() => setSelectedId(trip.id)}
                      onClick={() => setSelectedId(trip.id)}
                    >
                      <TableCell className="overflow-hidden">
                        <p className="font-medium">{trip.tripCode}</p>
                        <p className="mt-0.5 text-muted-foreground text-xs">{displayValue(trip.createdAt)}</p>
                      </TableCell>
                      <TableCell className="overflow-hidden">
                        <StatusBadge value={trip.status} />
                      </TableCell>
                      <TableCell className="min-w-0 overflow-hidden">
                        <p className="truncate text-sm" title={trip.pickup.address}>
                          {trip.pickup.address}
                        </p>
                        <p
                          className="mt-1 flex items-center gap-1 truncate text-muted-foreground text-xs"
                          title={trip.destination.address}
                        >
                          <MapPin className="size-3 shrink-0" />
                          {trip.destination.address} · {formatDistance(trip.distanceMeters)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">{trip.driver?.name ?? "Unassigned"}</TableCell>
                      <TableCell className="hidden 2xl:table-cell">
                        {formatFare(trip.actualFare ?? trip.fare, trip.currency)}
                      </TableCell>
                      <TableCell>
                        <ResourceActions
                          row={trip.raw}
                          actions={[]}
                          labelKeys={["tripCode"]}
                          detailsHref={`/dashboard/trips/${encodeURIComponent(trip.id)}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground text-sm">No trips match this search.</p>
              ) : null}
            </Card>
          ) : null}

          {layout === "list" ? (
            <div className="space-y-3 lg:hidden" data-testid="mobile-trip-list">
              {filtered.map((trip) => (
                <Card key={trip.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{trip.tripCode}</p>
                        <p className="mt-1 text-muted-foreground text-xs">{displayValue(trip.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge value={trip.status} />
                        <ResourceActions
                          row={trip.raw}
                          actions={[]}
                          labelKeys={["tripCode"]}
                          detailsHref={`/dashboard/trips/${encodeURIComponent(trip.id)}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="truncate">{trip.pickup.address}</p>
                      <p className="truncate text-muted-foreground">to {trip.destination.address}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      aria-label={`Preview route for ${trip.tripCode}`}
                      onClick={() => openMobile(trip)}
                    >
                      <Eye /> Preview route
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid content-start gap-3 2xl:grid-cols-2" data-testid="trip-grid">
              {filtered.map((trip) => (
                <Card
                  key={trip.id}
                  tabIndex={0}
                  data-selected={selected?.id === trip.id}
                  className="cursor-default transition-colors hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:bg-muted/50"
                  onPointerEnter={() => scheduleSelection(trip.id)}
                  onPointerLeave={cancelSelection}
                  onFocus={() => setSelectedId(trip.id)}
                  onClick={() => setSelectedId(trip.id)}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{trip.tripCode}</p>
                        <p className="mt-1 text-muted-foreground text-xs">{displayValue(trip.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge value={trip.status} />
                        <ResourceActions
                          row={trip.raw}
                          actions={[]}
                          labelKeys={["tripCode"]}
                          detailsHref={`/dashboard/trips/${encodeURIComponent(trip.id)}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 border-t pt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Pickup</p>
                        <p className="mt-0.5 truncate" title={trip.pickup.address}>
                          {trip.pickup.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Destination</p>
                        <p className="mt-0.5 truncate" title={trip.destination.address}>
                          {trip.destination.address}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
                        <span>{formatDistance(trip.distanceMeters)}</span>
                        <span>{formatFare(trip.actualFare ?? trip.fare, trip.currency)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full lg:hidden"
                      aria-label={`Preview route for ${trip.tripCode}`}
                      onClick={() => openMobile(trip)}
                    >
                      <Eye /> Preview route
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 ? (
                <p className="col-span-full rounded-xl border py-16 text-center text-muted-foreground text-sm">
                  No trips match this search.
                </p>
              ) : null}
            </div>
          )}

          <aside className="hidden self-start lg:sticky lg:top-4 lg:block">
            {selected ? (
              <TripPreview
                trip={selected}
                driverLocation={
                  (selected.driverId ? driverLocations[selected.driverId] : undefined) ?? driverLocations[selected.id]
                }
              />
            ) : null}
          </aside>
        </div>
      )}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="border-b">
            <SheetTitle>Trip route preview</SheetTitle>
            <SheetDescription>Pickup, destination, assigned driver, and trip summary.</SheetDescription>
          </SheetHeader>
          <div className="p-4">
            {selected ? (
              <TripPreview
                trip={selected}
                driverLocation={
                  (selected.driverId ? driverLocations[selected.driverId] : undefined) ?? driverLocations[selected.id]
                }
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
