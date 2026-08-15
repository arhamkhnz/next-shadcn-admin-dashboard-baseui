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
import { compactId, displayValue, rowsFromPayload } from "@/lib/display";
import { cn } from "@/lib/utils";

import { ActionConsole } from "./action-console";
import { type FleetRider, findFleetRiderForOrder } from "./fleet-map";
import { formatPaise, normaliseOrder, orderAsRouteSubject } from "./order-route";
import type { AdminOrder, OrderContact } from "./order-types";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";
import { formatDistance } from "./trip-route";
import { OperationalRouteMap } from "./trip-route-map";
import type { TripDriverLocation } from "./trip-types";

export type OrderTransition = {
  id?: string;
  previousState?: string;
  currentState?: string;
  fromState?: string;
  toState?: string;
  actorType?: string;
  actorId?: string;
  reasonCode?: string;
  occurredAt?: string;
};

export type OrderOffer = {
  id?: string;
  riderId?: string;
  state?: string;
  status?: string;
  offeredAt?: string;
  respondedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message ?? "Unable to load order details.");
    return body;
  });

export function OrderDetail({ orderId }: { orderId: string }) {
  const safeId = encodeURIComponent(orderId);
  const { data, error, isLoading, mutate } = useSWR(`/api/backend/operations/platform/orders/${safeId}`, fetcher, {
    refreshInterval: 15_000,
    keepPreviousData: true,
  });
  const { data: fleet } = useSWR<{ riders?: FleetRider[] }>(
    "/api/backend/operations/platform/fleet?limit=500",
    fetcher,
    { refreshInterval: 10_000, keepPreviousData: true },
  );
  const { data: timelineData } = useSWR(`/api/backend/operations/platform/orders/${safeId}/timeline`, fetcher, {
    refreshInterval: 10_000,
    keepPreviousData: true,
  });
  const { data: offerData } = useSWR(`/api/backend/operations/platform/orders/${safeId}/offers`, fetcher, {
    refreshInterval: 10_000,
    keepPreviousData: true,
  });

  if (isLoading) return <Skeleton className="h-[780px]" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Delivery order unavailable</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>{error.message}</span>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );

  const order = normaliseOrder(data);
  const riders = fleet?.riders ?? [];
  const rider = findFleetRiderForOrder(riders, order);
  const riderLocation: TripDriverLocation | undefined = rider?.location
    ? {
        name: rider.name,
        latitude: rider.location.latitude,
        longitude: rider.location.longitude,
        online: ["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY", "RETURNING"].includes(rider.state),
        capturedAt: rider.location.capturedAt,
        accuracyM: rider.location.accuracyM,
      }
    : undefined;
  const riderChoices = riders
    .filter((item) => ["ACTIVE_ONLINE", "RESERVED", "ON_DELIVERY"].includes(item.state))
    .map((item) => ({
      value: item.riderId,
      label: `${item.name} · ${item.vehicle.registrationNumber || item.vehicle.type}`,
    }));

  return (
    <OrderDetailView
      order={order}
      timeline={rowsFromPayload(timelineData) as OrderTransition[]}
      offers={rowsFromPayload(offerData) as OrderOffer[]}
      riderLocation={riderLocation}
      riderName={rider?.name}
      riderChoices={riderChoices}
    />
  );
}

export function OrderDetailView({
  order,
  timeline,
  offers,
  riderLocation,
  riderName,
  riderChoices = [],
}: {
  order: AdminOrder;
  timeline: OrderTransition[];
  offers: OrderOffer[];
  riderLocation?: TripDriverLocation;
  riderName?: string;
  riderChoices?: { label: string; value: string }[];
}) {
  return (
    <main className="min-w-0 space-y-5">
      <Link href="/dashboard/orders" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}>
        <ArrowLeft /> Back to delivery orders
      </Link>
      <PageHeader
        title={`Order ${order.reference}`}
        description={`${order.pickup.address} to ${order.drop.address}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={order.state} />
            {order.zoneId ? <Badge variant="outline">{order.zoneId}</Badge> : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric icon={<Route />} label="Distance" value={formatDistance(order.distanceMeters)} />
        <SummaryMetric icon={<CalendarClock />} label="Promised by" value={displayValue(order.promisedAt)} />
        <SummaryMetric icon={<IndianRupee />} label="Customer fee" value={formatPaise(order.customerFeePaise)} />
        <SummaryMetric
          icon={<UserRound />}
          label="Assigned rider"
          value={riderName ?? (order.riderId ? "Assigned" : "Unassigned")}
        />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Route and rider location</h2>
          <p className="text-muted-foreground text-sm">
            Inspect pickup, drop, and the rider&apos;s current or last-recorded position directly on the map.
          </p>
        </div>
        <OperationalRouteMap subject={orderAsRouteSubject(order)} driverLocation={riderLocation} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-4">
          <Section
            title="Pickup and drop"
            description="Addresses, contacts, and exact coordinates for both delivery stops."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <LocationCard label="Pickup" location={order.pickup} contact={order.pickupContact} tone="pickup" />
              <LocationCard label="Drop" location={order.drop} contact={order.dropContact} tone="drop" />
            </div>
          </Section>
          <Section title="Order timeline" description="Lifecycle transitions recorded by the delivery platform.">
            {timeline.length ? (
              <ol className="space-y-0">
                {timeline.map((item, index) => {
                  const from = item.previousState ?? item.fromState ?? "START";
                  const to = item.currentState ?? item.toState ?? "UNKNOWN";
                  return (
                    <li key={item.id ?? `${to}-${index}`} className="grid grid-cols-[24px_1fr] gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-0.5 grid size-5 place-items-center rounded-full border border-primary bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                        {index < timeline.length - 1 ? <span className="h-12 w-px bg-border" /> : null}
                      </div>
                      <div className="pb-5">
                        <p className="font-medium text-sm">
                          {readable(from)} to {readable(to)}
                        </p>
                        <p className="mt-0.5 text-muted-foreground text-xs">
                          {displayValue(item.occurredAt)} · {readable(item.actorType)} · {readable(item.reasonCode)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground text-sm">
                <CircleDot className="size-4" /> No transitions have been recorded yet.
              </p>
            )}
          </Section>
          <Section title="Driver offers" description="Assignment offers sent for this delivery order.">
            {offers.length ? (
              <div className="divide-y rounded-lg border">
                {offers.map((offer, index) => (
                  <div key={offer.id ?? `${offer.riderId}-${index}`} className="grid gap-2 p-3 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{compactId(offer.riderId)}</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Offered {displayValue(offer.offeredAt)}
                        {offer.respondedAt ? ` · Responded ${displayValue(offer.respondedAt)}` : ""}
                      </p>
                    </div>
                    <StatusBadge value={offer.state ?? offer.status ?? "UNKNOWN"} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No driver offers have been sent.</p>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Order information" description="Package, timing, and commercial information.">
            <InfoGrid
              values={[
                ["Items", order.itemSummary ?? "Not provided"],
                ["Declared value", formatPaise(order.declaredValuePaise)],
                ["Customer fee", formatPaise(order.customerFeePaise)],
                ["Distance", formatDistance(order.distanceMeters)],
                ["Promised at", displayValue(order.promisedAt)],
                ["Updated at", displayValue(order.updatedAt)],
              ]}
            />
          </Section>
          <Section title="Record identifiers" description="Copy these references for support or API investigations.">
            <div className="space-y-2">
              <CopyId label="Order ID" value={order.id} />
              <CopyId label="Rider ID" value={order.riderId} />
              <CopyId label="Partner ID" value={order.partnerId} />
            </div>
          </Section>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Operational actions</h2>
          <p className="text-muted-foreground text-sm">Order-scoped interventions use this order automatically.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ActionConsole
            fixedId={order.id}
            title="Manual driver offer"
            description="Choose an available driver and send this order directly."
            endpoint="operations/platform/orders/{id}/manual-offer"
            fields={[
              riderChoices.length
                ? { name: "riderId", label: "Driver", choices: riderChoices }
                : { name: "riderId", label: "Driver ID", placeholder: "No available driver data" },
              { name: "reasonCode", label: "Reason code" },
            ]}
          />
          <ActionConsole
            fixedId={order.id}
            title="Confirm estimated route"
            description="Confirm a fallback route before dispatch."
            endpoint="operations/platform/orders/{id}/fallback-route/confirm"
            fields={[{ name: "reasonCode", label: "Reason code" }]}
          />
          <ActionConsole
            fixedId={order.id}
            title="Resolve pickup exception"
            description="Release this order after resolving its pickup exception."
            endpoint="operations/platform/orders/{id}/pickup-exception/resolve"
            fields={[{ name: "reasonCode", label: "Reason code" }]}
          />
          <ActionConsole
            fixedId={order.id}
            title="Approve wrong-address requote"
            description="Approve updated routing and pricing after an address correction."
            endpoint="operations/platform/orders/{id}/wrong-address/approve"
            fields={[{ name: "reasonCode", label: "Reason code" }]}
          />
        </div>
      </section>
    </main>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 truncate font-semibold text-lg" title={value}>
            {value}
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground [&_svg]:size-5">{icon}</span>
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
  location,
  contact,
  tone,
}: {
  label: string;
  location: AdminOrder["pickup"];
  contact: OrderContact;
  tone: "pickup" | "drop";
}) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full", tone === "pickup" ? "bg-emerald-600" : "bg-red-600")} />
        <p className="font-medium text-sm">{label}</p>
      </div>
      <p className="mt-3 text-sm">{location.address}</p>
      <code className="mt-2 block font-mono text-muted-foreground text-xs">
        {Number.isFinite(location.latitude) ? location.latitude.toFixed(6) : "—"},{" "}
        {Number.isFinite(location.longitude) ? location.longitude.toFixed(6) : "—"}
      </code>
      <div className="mt-3 border-t pt-3">
        <p className="font-medium text-sm">{contact.name}</p>
        <p className="mt-1 text-muted-foreground text-xs">{contact.mobile ?? "Mobile unavailable"}</p>
      </div>
    </div>
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
