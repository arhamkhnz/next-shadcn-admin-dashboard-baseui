"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowUpRight,
  Bike,
  Headphones,
  IndianRupee,
  PackageCheck,
  ShieldAlert,
  Users,
} from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { displayValue, formatResourceValue, titleFromKey } from "@/lib/display";

import { PageHeader } from "./page-header";

type Dashboard = {
  metrics: Record<string, number>;
  alerts: { severity: string; code: string; count: number; message: string }[];
  orderAgeing: Record<string, unknown>[];
  zoneSupply: Record<string, unknown>[];
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });

const cards = [
  {
    key: "riderCount",
    label: "Total drivers",
    description: "Driver roster",
    href: "/dashboard/drivers",
    icon: Users,
  },
  {
    key: "onlineCount",
    label: "Online now",
    description: "Live map",
    href: "/dashboard/map",
    icon: Bike,
  },
  {
    key: "activeOrderCount",
    label: "Active deliveries",
    description: "Dispatch queue",
    href: "/dashboard/orders",
    icon: PackageCheck,
  },
  {
    key: "openCaseCount",
    label: "Open support",
    description: "SLA cases",
    href: "/dashboard/support",
    icon: Headphones,
  },
  {
    key: "activeIncidentCount",
    label: "Safety incidents",
    description: "SOS queue",
    href: "/dashboard/safety",
    icon: ShieldAlert,
  },
  {
    key: "pendingPayoutCount",
    label: "Pending payouts",
    description: "Finance review",
    href: "/dashboard/finance",
    icon: IndianRupee,
  },
] as const;

const alertLinks: Record<string, string> = {
  UNASSIGNED_ORDER_SLA: "/dashboard/orders",
  SOS_ACK_SLA: "/dashboard/safety",
  STALE_LOCATION: "/dashboard/map",
  SUPPORT_SLA: "/dashboard/support",
};

export function OperationsOverview() {
  const { data, error, isLoading } = useSWR<Dashboard>("/api/backend/operations/platform/dashboard", fetcher, {
    refreshInterval: 15_000,
  });
  let content = null;

  if (isLoading) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key }) => (
          <Skeleton key={key} className="h-32" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Operations data unavailable</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  } else if (data) {
    content = (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ key, ...card }) => (
            <MetricCard key={key} {...card} value={data.metrics[key] ?? 0} />
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="font-heading font-medium text-base leading-snug">Operations health</h2>
            <CardDescription>Click an alert to jump directly to the queue that needs attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.length > 0 ? (
              data.alerts.map((item) => <AlertShortcut item={item} key={item.code} />)
            ) : (
              <Alert>
                <AlertTitle>No active platform alerts</AlertTitle>
                <AlertDescription>Operational service-level checks are currently within thresholds.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <InfographicCard
            title="Order ageing infographic"
            description="Oldest active work by delivery state. Click through to Delivery orders for action."
            href="/dashboard/orders"
            rows={data.orderAgeing}
            labelKey="state"
            valueKey="count"
            metaKey="oldestAt"
            emptyMessage="No ageing order states are currently reported."
          />
          <InfographicCard
            title="Driver supply infographic"
            description="Currently available driver supply by zone. Click through to the live driver map."
            href="/dashboard/map"
            rows={data.zoneSupply}
            labelKey="zoneId"
            valueKey="onlineRiders"
            emptyMessage="No zone supply is currently reported."
          />
        </div>
      </>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Operations overview"
        description="Live demand, supply, delivery, support, safety, and payout health across LiftNGo."
      />
      {content}
    </main>
  );
}

function MetricCard({
  label,
  description,
  href,
  icon: Icon,
  value,
}: {
  label: string;
  description: string;
  href: string;
  icon: typeof Users;
  value: number;
}) {
  return (
    <Link
      className="group block rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <Card className="h-full transition group-hover:border-foreground/20 group-hover:bg-muted/30">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardDescription>{label}</CardDescription>
            <p className="mt-1 text-muted-foreground text-xs">{description}</p>
          </div>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3">
            <p className="font-semibold text-4xl tabular-nums">{displayValue(value)}</p>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs group-hover:text-foreground">
              Open
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AlertShortcut({ item }: { item: Dashboard["alerts"][number] }) {
  const href = alertLinks[item.code] ?? "/dashboard/audit";
  const destructive = item.severity === "critical";
  return (
    <Link
      className="block rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <Alert
        variant={destructive ? "destructive" : "default"}
        className="transition hover:border-foreground/20 hover:bg-muted/30"
      >
        <AlertTriangle />
        <AlertTitle className="flex items-center justify-between gap-3">
          <span>{titleFromKey(item.code)}</span>
          <span className="inline-flex items-center gap-1 font-normal text-xs">
            Open queue
            <ArrowUpRight className="size-3" />
          </span>
        </AlertTitle>
        <AlertDescription>
          {item.message} ({item.count})
        </AlertDescription>
      </Alert>
    </Link>
  );
}

function InfographicCard({
  title,
  description,
  href,
  rows,
  labelKey,
  valueKey,
  metaKey,
  emptyMessage,
}: {
  title: string;
  description: string;
  href: string;
  rows: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  metaKey?: string;
  emptyMessage: string;
}) {
  const max = Math.max(1, ...rows.map((row) => Number(row[valueKey] ?? 0)));
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-medium text-base leading-snug">{title}</h2>
            <CardDescription>{description}</CardDescription>
          </div>
          <Link
            className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
            href={href}
          >
            Open
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="rounded-lg border px-4 py-10 text-center text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const value = Number(row[valueKey] ?? 0);
              const label = formatResourceValue(labelKey, row[labelKey]);
              const width = `${Math.max(8, Math.round((value / max) * 100))}%`;
              return (
                <Link
                  className="block rounded-lg border p-3 transition hover:border-foreground/20 hover:bg-muted/30"
                  href={href}
                  key={`${label}-${formatResourceValue(metaKey ?? valueKey, row[metaKey ?? valueKey])}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{label}</span>
                    <span className="font-semibold tabular-nums">{displayValue(value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width }} />
                  </div>
                  {metaKey ? (
                    <p className="mt-2 text-muted-foreground text-xs">
                      Oldest at {formatResourceValue(metaKey, row[metaKey])}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
