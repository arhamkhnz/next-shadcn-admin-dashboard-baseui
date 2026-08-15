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
import { OrderPreview } from "./order-preview";
import { formatPaise, normaliseOrder } from "./order-route";
import type { AdminOrder } from "./order-types";
import { usePersistentLayout } from "./persistent-layout";
import { ResourceActions } from "./resource-actions";
import { StatusBadge } from "./status-badge";
import { formatDistance } from "./trip-route";
import type { TripDriverLocation } from "./trip-types";

export function OrderWorkspace({
  rows,
  onRefresh,
  isRefreshing = false,
  riderLocations = {},
}: {
  rows: Record<string, unknown>[];
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
  riderLocations?: Record<string, TripDriverLocation>;
}) {
  const [layout, setLayout] = usePersistentLayout();
  const orders = useMemo(() => rows.map(normaliseOrder), [rows]);
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtered = useMemo(
    () =>
      deferredQuery
        ? orders.filter((order) =>
            [
              order.reference,
              order.state,
              order.pickup.address,
              order.drop.address,
              order.pickupContact.name,
              order.dropContact.name,
              order.itemSummary,
              order.riderId,
              order.partnerId,
            ]
              .join(" ")
              .toLowerCase()
              .includes(deferredQuery),
          )
        : orders,
    [deferredQuery, orders],
  );
  const selected = orders.find((order) => order.id === selectedId) ?? filtered[0] ?? orders[0];
  const exportRows = filtered.map((order) => ({
    reference: order.reference,
    state: order.state,
    pickupAddress: order.pickup.address,
    pickupLatitude: order.pickup.latitude,
    pickupLongitude: order.pickup.longitude,
    dropAddress: order.drop.address,
    dropLatitude: order.drop.latitude,
    dropLongitude: order.drop.longitude,
    riderId: order.riderId,
    partnerId: order.partnerId,
    customerFee: formatPaise(order.customerFeePaise),
    updatedAt: order.updatedAt,
  }));
  const exportColumns = [
    "reference",
    "state",
    "pickupAddress",
    "pickupLatitude",
    "pickupLongitude",
    "dropAddress",
    "dropLatitude",
    "dropLongitude",
    "riderId",
    "partnerId",
    "customerFee",
    "updatedAt",
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

  function openMobile(order: AdminOrder) {
    setSelectedId(order.id);
    setMobileOpen(true);
  }

  function locationFor(order: AdminOrder) {
    return (order.riderId ? riderLocations[order.riderId] : undefined) ?? riderLocations[order.id];
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders, routes, contacts…"
            className="pl-9"
            aria-label="Search delivery orders"
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <ExportRecordsButton rows={exportRows} columns={exportColumns} filename="delivery-orders" />
          <LayoutToggle value={layout} onChange={setLayout} />
          {onRefresh ? (
            <Button size="sm" variant="outline" onClick={() => onRefresh()} disabled={isRefreshing}>
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
          ) : null}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No delivery orders are available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          {layout === "list" ? (
            <Card className="hidden min-w-0 overflow-hidden lg:block">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Order</TableHead>
                    <TableHead className="w-28">State</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Fee</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Updated</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow
                      key={order.id}
                      data-testid={`order-row-${order.id}`}
                      tabIndex={0}
                      aria-selected={selected?.id === order.id}
                      data-selected={selected?.id === order.id}
                      className="cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[selected=true]:bg-muted/70"
                      onPointerEnter={() => scheduleSelection(order.id)}
                      onPointerLeave={cancelSelection}
                      onFocus={() => setSelectedId(order.id)}
                      onClick={() => setSelectedId(order.id)}
                    >
                      <TableCell className="overflow-hidden">
                        <p className="truncate font-medium" title={order.reference}>
                          {order.reference}
                        </p>
                        <p className="mt-0.5 truncate text-muted-foreground text-xs" title={order.itemSummary}>
                          {order.itemSummary ?? "Delivery order"}
                        </p>
                      </TableCell>
                      <TableCell className="overflow-hidden">
                        <StatusBadge value={order.state} />
                      </TableCell>
                      <TableCell className="min-w-0 overflow-hidden">
                        <p className="truncate text-sm" title={order.pickup.address}>
                          {order.pickup.address}
                        </p>
                        <p
                          className="mt-1 flex items-center gap-1 truncate text-muted-foreground text-xs"
                          title={order.drop.address}
                        >
                          <MapPin className="size-3 shrink-0" />
                          {order.drop.address} · {formatDistance(order.distanceMeters)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">{formatPaise(order.customerFeePaise)}</TableCell>
                      <TableCell className="hidden 2xl:table-cell">{displayValue(order.updatedAt)}</TableCell>
                      <TableCell>
                        <ResourceActions
                          row={order.raw}
                          actions={[]}
                          labelKeys={["partnerReference", "externalOrderId"]}
                          detailsHref={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground text-sm">No delivery orders match this search.</p>
              ) : null}
            </Card>
          ) : null}

          {layout === "list" ? (
            <div className="space-y-3 lg:hidden" data-testid="mobile-order-list">
              {filtered.map((order) => (
                <Card key={order.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{order.reference}</p>
                        <p className="mt-1 truncate text-muted-foreground text-xs">
                          {order.itemSummary ?? "Delivery order"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge value={order.state} />
                        <ResourceActions
                          row={order.raw}
                          actions={[]}
                          labelKeys={["partnerReference", "externalOrderId"]}
                          detailsHref={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="truncate">{order.pickup.address}</p>
                      <p className="truncate text-muted-foreground">to {order.drop.address}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      aria-label={`Preview route for ${order.reference}`}
                      onClick={() => openMobile(order)}
                    >
                      <Eye /> Preview route
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid content-start gap-3 2xl:grid-cols-2" data-testid="order-grid">
              {filtered.map((order) => (
                <Card
                  key={order.id}
                  tabIndex={0}
                  data-selected={selected?.id === order.id}
                  className="cursor-default transition-colors hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:bg-muted/50"
                  onPointerEnter={() => scheduleSelection(order.id)}
                  onPointerLeave={cancelSelection}
                  onFocus={() => setSelectedId(order.id)}
                  onClick={() => setSelectedId(order.id)}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{order.reference}</p>
                        <p className="mt-1 truncate text-muted-foreground text-xs">
                          {order.itemSummary ?? "Delivery order"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge value={order.state} />
                        <ResourceActions
                          row={order.raw}
                          actions={[]}
                          labelKeys={["partnerReference", "externalOrderId"]}
                          detailsHref={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 border-t pt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Pickup</p>
                        <p className="mt-0.5 truncate" title={order.pickup.address}>
                          {order.pickup.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Drop</p>
                        <p className="mt-0.5 truncate" title={order.drop.address}>
                          {order.drop.address}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
                        <span>{formatDistance(order.distanceMeters)}</span>
                        <span>{formatPaise(order.customerFeePaise)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full lg:hidden"
                      aria-label={`Preview route for ${order.reference}`}
                      onClick={() => openMobile(order)}
                    >
                      <Eye /> Preview route
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 ? (
                <p className="col-span-full rounded-xl border py-16 text-center text-muted-foreground text-sm">
                  No delivery orders match this search.
                </p>
              ) : null}
            </div>
          )}

          <aside className="hidden self-start lg:sticky lg:top-4 lg:block">
            {selected ? <OrderPreview order={selected} riderLocation={locationFor(selected)} /> : null}
          </aside>
        </div>
      )}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="border-b">
            <SheetTitle>Delivery route preview</SheetTitle>
            <SheetDescription>Pickup, drop, assigned rider, and order summary.</SheetDescription>
          </SheetHeader>
          <div className="p-4">
            {selected ? <OrderPreview order={selected} riderLocation={locationFor(selected)} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
