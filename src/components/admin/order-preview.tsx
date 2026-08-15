"use client";

import Link from "next/link";

import { ArrowRight, CalendarClock, IndianRupee, PackageCheck, Route, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { displayValue } from "@/lib/display";
import { cn } from "@/lib/utils";

import { formatPaise, orderAsRouteSubject } from "./order-route";
import type { AdminOrder } from "./order-types";
import { StatusBadge } from "./status-badge";
import { formatDistance } from "./trip-route";
import { OperationalRouteMap } from "./trip-route-map";
import type { TripDriverLocation } from "./trip-types";

export function OrderPreview({ order, riderLocation }: { order: AdminOrder; riderLocation?: TripDriverLocation }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Live delivery preview</p>
            <h3 className="mt-1 truncate font-heading font-medium text-base leading-snug">
              {order.reference} route preview
            </h3>
          </div>
          <StatusBadge value={order.state} />
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <span className="mt-1 size-2 rounded-full bg-emerald-600" aria-hidden="true" />
          <p className="truncate" title={order.pickup.address}>
            {order.pickup.address}
          </p>
          <span className="mt-1 size-2 rounded-full bg-red-600" aria-hidden="true" />
          <p className="truncate" title={order.drop.address}>
            {order.drop.address}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <OperationalRouteMap subject={orderAsRouteSubject(order)} driverLocation={riderLocation} compact />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Metric icon={<Route />} label="Distance" value={formatDistance(order.distanceMeters)} />
          <Metric icon={<IndianRupee />} label="Customer fee" value={formatPaise(order.customerFeePaise)} />
          <Metric icon={<PackageCheck />} label="Declared value" value={formatPaise(order.declaredValuePaise)} />
          <Metric icon={<UserRound />} label="Rider" value={order.riderId ? "Assigned" : "Unassigned"} />
        </dl>
        <div className="space-y-2 border-t pt-3 text-xs">
          <div>
            <p className="text-muted-foreground">Items</p>
            <p className="mt-1 font-medium">{order.itemSummary ?? "Item summary unavailable"}</p>
          </div>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Promised {displayValue(order.promisedAt)}
          </p>
          <p className="text-muted-foreground">Updated {displayValue(order.updatedAt)}</p>
        </div>
        <Link href={`/dashboard/orders/${encodeURIComponent(order.id)}`} className={cn(buttonVariants(), "w-full")}>
          View full order details
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
