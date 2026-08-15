"use client";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  CircleDot,
  Copy,
  IndianRupee,
  Route,
  UserRound,
} from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { compactId, displayValue } from "@/lib/display";
import { cn } from "@/lib/utils";

import { type FleetRider, findFleetRiderForTrip } from "./fleet-map";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";
import { formatFare } from "./trip-preview";
import { formatDistance, formatDuration, normaliseTrip } from "./trip-route";
import { TripRouteMap } from "./trip-route-map";
import type { AdminTrip, TripDriverLocation, TripPerson } from "./trip-types";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message ?? "Unable to load trip details.");
    return body;
  });

export function TripDetail({ tripId }: { tripId: string }) {
  const safeId = encodeURIComponent(tripId);
  const { data, error, isLoading, mutate } = useSWR(`/api/backend/trips/${safeId}`, fetcher);
  const { data: fleet } = useSWR<{ riders?: FleetRider[] }>(
    "/api/backend/operations/platform/fleet?limit=500",
    fetcher,
    { refreshInterval: 10_000, keepPreviousData: true },
  );
  if (isLoading) return <Skeleton className="h-[720px]" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Trip unavailable</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>{error.message}</span>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  const trip = normaliseTrip(data);
  const rider = findFleetRiderForTrip(fleet?.riders ?? [], trip);
  const driverLocation: TripDriverLocation | undefined = rider?.location
    ? {
        name: rider.name,
        latitude: rider.location.latitude,
        longitude: rider.location.longitude,
        online: ["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY", "RETURNING"].includes(rider.state),
        capturedAt: rider.location.capturedAt,
        accuracyM: rider.location.accuracyM,
      }
    : undefined;
  return <TripDetailView trip={trip} driverLocation={driverLocation} />;
}

export function TripDetailView({ trip, driverLocation }: { trip: AdminTrip; driverLocation?: TripDriverLocation }) {
  const timeline = [
    ["Trip created", trip.createdAt],
    ["Driver accepted", trip.acceptedAt],
    ["Driver arrived", trip.driverArrivedAt],
    ["Picked up", trip.pickedUpAt],
    ["Delivered", trip.deliveredAt],
    ["Cancelled", trip.cancelledAt],
  ] as const;
  return (
    <main className="min-w-0 space-y-5">
      <Link href="/dashboard/trips" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}>
        <ArrowLeft /> Back to trips
      </Link>
      <PageHeader
        title={`Trip ${trip.tripCode}`}
        description={`${trip.pickup.address} to ${trip.destination.address}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={trip.status} />
            <Badge variant="outline">{trip.vehicleType.replaceAll("_", " ")}</Badge>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric icon={<Route />} label="Distance" value={formatDistance(trip.distanceMeters)} />
        <SummaryMetric icon={<CalendarClock />} label="Estimated time" value={formatDuration(trip.durationSeconds)} />
        <SummaryMetric
          icon={<IndianRupee />}
          label="Fare"
          value={formatFare(trip.actualFare ?? trip.fare, trip.currency)}
        />
        <SummaryMetric icon={<UserRound />} label="Assigned driver" value={trip.driver?.name ?? "Unassigned"} />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Route and live location</h2>
          <p className="text-muted-foreground text-sm">
            Hover or tap the map markers, or use the location controls, to inspect the full address and coordinates.
          </p>
        </div>
        <TripRouteMap trip={trip} driverLocation={driverLocation} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-4">
          <Section title="Route stops" description="Complete pickup and destination information.">
            <div className="grid gap-3 sm:grid-cols-2">
              <LocationCard
                label="Pickup"
                address={trip.pickup.address}
                latitude={trip.pickup.latitude}
                longitude={trip.pickup.longitude}
                tone="pickup"
              />
              <LocationCard
                label="Destination"
                address={trip.destination.address}
                latitude={trip.destination.latitude}
                longitude={trip.destination.longitude}
                tone="destination"
              />
            </div>
          </Section>
          <Section title="Trip timeline" description="Operational milestones recorded by the trip service.">
            <ol className="space-y-0">
              {timeline.map(([label, value], index) => (
                <li key={label} className="grid grid-cols-[24px_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 place-items-center rounded-full border",
                        value ? "border-primary bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {value ? <Check className="size-3" /> : <CircleDot className="size-3" />}
                    </span>
                    {index < timeline.length - 1 ? <span className="h-10 w-px bg-border" /> : null}
                  </div>
                  <div className="pb-5">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      {value ? displayValue(value) : "Not recorded"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="space-y-4">
          <PersonCard title="Customer" person={trip.customer} fallbackId={trip.customerId} />
          <PersonCard
            title="Assigned driver"
            person={trip.driver}
            fallbackId={trip.driverId}
            driverLocation={driverLocation}
          />
          <Section title="Fare and payment" description="Commercial details for this trip.">
            <InfoGrid
              values={[
                ["Estimated fare", formatFare(trip.fare, trip.currency)],
                ["Actual fare", formatFare(trip.actualFare, trip.currency)],
                ["Booking type", readable(trip.bookingType)],
                ["Payment status", readable(trip.paymentStatus)],
                ["Currency", trip.currency],
                ["Business", trip.businessName ?? "Not provided"],
              ]}
            />
          </Section>
          <Section title="Exceptions" description="Cancellation and operational exception information.">
            {trip.cancellationReason || trip.cancelledAt ? (
              <InfoGrid
                values={[
                  ["Reason", readable(trip.cancellationReason)],
                  ["Details", trip.cancellationReasonOther ?? "Not provided"],
                  ["Cancelled by", readable(trip.cancelledBy)],
                  ["Cancelled at", displayValue(trip.cancelledAt)],
                ]}
              />
            ) : (
              <p className="text-muted-foreground text-sm">No trip exceptions are recorded.</p>
            )}
          </Section>
          <Section title="Record identifiers" description="Use these references for support or API investigations.">
            <div className="space-y-2">
              <CopyId label="Trip ID" value={trip.id} />
              <CopyId label="Customer ID" value={trip.customerId} />
              <CopyId label="Driver ID" value={trip.driverId} />
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 font-semibold text-lg">{value}</p>
        </div>
        <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>
      </CardContent>
    </Card>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading font-medium text-base">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LocationCard({
  label,
  address,
  latitude,
  longitude,
  tone,
}: {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  tone: "pickup" | "destination";
}) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full", tone === "pickup" ? "bg-emerald-600" : "bg-red-600")} />
        <p className="font-medium text-sm">{label}</p>
      </div>
      <p className="mt-3 text-sm">{address}</p>
      <code className="mt-2 block font-mono text-muted-foreground text-xs">
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </code>
    </div>
  );
}

function PersonCard({
  title,
  person,
  fallbackId,
  driverLocation,
}: {
  title: string;
  person?: TripPerson;
  fallbackId?: string;
  driverLocation?: TripDriverLocation;
}) {
  return (
    <Section
      title={title}
      description={
        title === "Customer" ? "Booking account and contact details." : "Assigned driver and location state."
      }
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
          <UserRound className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{person?.name ?? "Not assigned"}</p>
          <p className="mt-1 text-muted-foreground text-sm">{person?.mobile ?? "Mobile unavailable"}</p>
          {person?.email ? <p className="text-muted-foreground text-sm">{person.email}</p> : null}
          <p className="mt-2 font-mono text-muted-foreground text-xs">{compactId(person?.id ?? fallbackId)}</p>
          {driverLocation ? (
            <Badge variant="outline" className="mt-2">
              {driverLocation.online ? "Online · live location" : "Offline · last known location"}
            </Badge>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

function InfoGrid({ values }: { values: [string, string][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      {values.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="mt-1 break-words text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CopyId({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <code className="block truncate font-mono text-xs" title={value}>
          {compactId(value)}
        </code>
      </div>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Copy ${label}`}
          onClick={() => navigator.clipboard?.writeText(value)}
        >
          <Copy />
        </Button>
      ) : null}
    </div>
  );
}

function readable(value?: string): string {
  return value
    ? value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase())
    : "Not available";
}
