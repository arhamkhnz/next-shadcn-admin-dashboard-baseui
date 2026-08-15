"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { rowsFromPayload } from "@/lib/display";

import type { FleetRider } from "./fleet-map";
import { OrderWorkspace } from "./order-workspace";
import { PageHeader } from "./page-header";
import type { TripDriverLocation } from "./trip-types";

const ordersEndpoint = "/api/backend/operations/platform/orders?limit=200";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message ?? "Unable to load delivery orders.");
    return body;
  });

export function OrdersScreen() {
  const {
    data: orders,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(ordersEndpoint, fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const { data: fleet } = useSWR<{ riders?: FleetRider[] }>(
    "/api/backend/operations/platform/fleet?limit=500",
    fetcher,
    { refreshInterval: 10_000, revalidateOnFocus: true, keepPreviousData: true },
  );

  const riderLocations = (fleet?.riders ?? []).reduce<Record<string, TripDriverLocation>>((locations, rider) => {
    if (!rider.location) return locations;
    const location: TripDriverLocation = {
      name: rider.name,
      latitude: rider.location.latitude,
      longitude: rider.location.longitude,
      online: ["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY", "RETURNING"].includes(rider.state),
      capturedAt: rider.location.capturedAt,
      accuracyM: rider.location.accuracyM,
    };
    locations[rider.riderId] = location;
    if (rider.activeWork?.kind === "DELIVERY_ORDER" && rider.activeWork.id) locations[rider.activeWork.id] = location;
    return locations;
  }, {});

  return (
    <main className="space-y-6">
      <PageHeader
        title="Delivery orders"
        description="Monitor partner deliveries spatially from assignment through pickup, drop, exceptions, returns, and completion."
      />
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-[620px]" />
        </div>
      ) : null}
      {!isLoading && error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Delivery orders unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error.message}</span>
            <Button size="sm" variant="outline" onClick={() => mutate()}>
              <RefreshCw /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {!isLoading && !error ? (
        <OrderWorkspace
          rows={rowsFromPayload(orders)}
          onRefresh={mutate}
          isRefreshing={isValidating}
          riderLocations={riderLocations}
        />
      ) : null}
    </main>
  );
}
