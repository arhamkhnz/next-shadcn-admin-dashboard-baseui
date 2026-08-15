"use client";

import Link from "next/link";

import { ArrowRight, CalendarClock, IndianRupee, Route, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { displayValue } from "@/lib/display";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./status-badge";
import { formatDistance, formatDuration } from "./trip-route";
import { TripRouteMap } from "./trip-route-map";
import type { AdminTrip, TripDriverLocation } from "./trip-types";

export function TripPreview({ trip, driverLocation }: { trip: AdminTrip; driverLocation?: TripDriverLocation }) {
  const fare = trip.actualFare ?? trip.fare;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Live trip preview</p>
            <h3 className="mt-1 truncate font-heading font-medium text-base leading-snug">
              {trip.tripCode} route preview
            </h3>
          </div>
          <StatusBadge value={trip.status} />
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <span className="mt-1 size-2 rounded-full bg-emerald-600" aria-hidden="true" />
          <p className="truncate" title={trip.pickup.address}>
            {trip.pickup.address}
          </p>
          <span className="mt-1 size-2 rounded-full bg-red-600" aria-hidden="true" />
          <p className="truncate" title={trip.destination.address}>
            {trip.destination.address}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <TripRouteMap trip={trip} driverLocation={driverLocation} compact />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Metric icon={<Route />} label="Distance" value={formatDistance(trip.distanceMeters)} />
          <Metric icon={<CalendarClock />} label="Duration" value={formatDuration(trip.durationSeconds)} />
          <Metric icon={<IndianRupee />} label="Fare" value={formatFare(fare, trip.currency)} />
          <Metric icon={<UserRound />} label="Driver" value={trip.driver?.name ?? "Unassigned"} />
        </dl>
        <div className="border-t pt-3 text-xs">
          <p className="text-muted-foreground">Customer</p>
          <p className="mt-1 font-medium">{trip.customer?.name ?? "Customer details unavailable"}</p>
          <p className="mt-1 text-muted-foreground">Created {displayValue(trip.createdAt)}</p>
        </div>
        <Link href={`/dashboard/trips/${encodeURIComponent(trip.id)}`} className={cn(buttonVariants(), "w-full")}>
          View full trip details
          <ArrowRight />
        </Link>
      </CardContent>
    </Card>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-2.5">
      <dt className="flex items-center gap-1.5 text-muted-foreground text-xs [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate font-medium" title={value}>
        {value}
      </dd>
    </div>
  );
}

export function formatFare(value: number | undefined, currency: string): string {
  if (value === undefined || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}
