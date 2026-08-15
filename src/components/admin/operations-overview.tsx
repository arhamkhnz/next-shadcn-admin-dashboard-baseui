"use client";

import { AlertTriangle, Bike, Headphones, IndianRupee, PackageCheck, ShieldAlert, Users } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { displayValue, titleFromKey } from "@/lib/display";

import { PageHeader } from "./page-header";
import { ResourceTable } from "./resource-table";

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
  ["riderCount", "Total drivers", Users],
  ["onlineCount", "Online now", Bike],
  ["activeOrderCount", "Active deliveries", PackageCheck],
  ["openCaseCount", "Open support", Headphones],
  ["activeIncidentCount", "Safety incidents", ShieldAlert],
  ["pendingPayoutCount", "Pending payouts", IndianRupee],
] as const;

export function OperationsOverview() {
  const { data, error, isLoading } = useSWR<Dashboard>("/api/backend/operations/platform/dashboard", fetcher, {
    refreshInterval: 15_000,
  });
  return (
    <main className="space-y-6">
      <PageHeader
        title="Operations overview"
        description="Live demand, supply, delivery, support, safety, and payout health across LiftNGo."
      />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([key]) => (
            <Skeleton key={key} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Operations data unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([key, label, Icon]) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>{label}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-3xl tabular-nums">{displayValue(data.metrics[key])}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((item) => (
                <Alert key={item.code} variant={item.severity === "critical" ? "destructive" : "default"}>
                  <AlertTriangle />
                  <AlertTitle>{titleFromKey(item.code)}</AlertTitle>
                  <AlertDescription>
                    {item.message} ({item.count})
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>No active platform alerts</AlertTitle>
              <AlertDescription>Operational service-level checks are currently within thresholds.</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active order ageing</CardTitle>
                <CardDescription>Oldest work by delivery state</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceTable rows={data.orderAgeing} columns={["state", "count", "oldestAt"]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Driver supply by zone</CardTitle>
                <CardDescription>Currently available driver supply</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceTable rows={data.zoneSupply} columns={["zoneId", "onlineRiders"]} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </main>
  );
}
