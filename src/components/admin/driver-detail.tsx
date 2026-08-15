"use client";

import { type FormEvent, useState } from "react";

import { AlertCircle, Save } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { displayValue, rowsFromPayload } from "@/lib/display";

import { PageHeader } from "./page-header";
import { ResourceTable } from "./resource-table";
import { StatusBadge } from "./status-badge";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });
type DriverDetailData = {
  rider: {
    state: string;
    onboardingState?: string;
    mobile: string;
    personal: Record<string, unknown> & { fullName?: string };
    vehicle: Record<string, unknown>;
    compliance?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  documents: Record<string, unknown>[];
  devices: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  availability: Record<string, unknown> | null;
};
export function DriverDetail({ riderId }: { riderId: string }) {
  const safe = encodeURIComponent(riderId);
  const endpoint = `/api/backend/operations/platform/riders/${safe}`;
  const { data, error, isLoading, mutate } = useSWR<DriverDetailData>(endpoint, fetcher);
  const { data: locations } = useSWR(
    `/api/backend/operations/platform/riders/${safe}/locations?reasonCode=ADMIN_DRIVER_REVIEW&limit=100`,
    fetcher,
  );
  const [message, setMessage] = useState("");
  async function changeState(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/backend/operations/platform/riders/${safe}/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: form.get("state"), reasonCode: form.get("reasonCode"), note: form.get("note") }),
    });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Driver state updated or sent for approval." : (body.message ?? "State update failed."));
    if (response.ok) await mutate();
  }
  return (
    <main className="space-y-6">
      <PageHeader
        title={data?.rider?.personal?.fullName ?? "Driver details"}
        description={`Full operational record for driver ${riderId}. Location-history access is recorded in the audit log.`}
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Driver unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Account and vehicle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <StatusBadge value={data.rider.state} />
                  <StatusBadge value={data.rider.onboardingState} />
                </div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify(
                    {
                      mobile: data.rider.mobile,
                      personal: data.rider.personal,
                      vehicle: data.rider.vehicle,
                      compliance: data.rider.compliance,
                    },
                    null,
                    2,
                  )}
                </pre>
                <p>
                  Created {displayValue(data.rider.createdAt)} · Updated {displayValue(data.rider.updatedAt)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Change driver state</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={changeState} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <NativeSelect id="state" name="state" className="w-full">
                      <NativeSelectOption value="ACTIVE_OFFLINE">Active offline</NativeSelectOption>
                      <NativeSelectOption value="SUSPENDED">Suspend</NativeSelectOption>
                      <NativeSelectOption value="DEACTIVATED">Deactivate (approval)</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reasonCode">Reason code</Label>
                    <Input id="reasonCode" name="reasonCode" required placeholder="SUPPORT_CASE_123" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Input id="note" name="note" required />
                  </div>
                  <Button type="submit">
                    <Save />
                    Apply
                  </Button>
                  <p className="text-muted-foreground text-xs" role="status">
                    {message}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
          <Section title="Uploaded documents">
            <ResourceTable
              rows={rowsFromPayload(data.documents)}
              columns={["id", "type", "status", "storageKey", "reviewedAt", "updatedAt"]}
            />
          </Section>
          <Section title="Last and historical locations">
            <ResourceTable
              rows={rowsFromPayload(locations)}
              columns={[
                "capturedAt",
                "latitude",
                "longitude",
                "accuracyM",
                "speedMps",
                "batteryPercent",
                "networkType",
              ]}
            />
          </Section>
          <Section title="Availability">
            <ResourceTable
              rows={data.availability ? [data.availability] : []}
              columns={["id", "zoneId", "startedAt", "endedAt", "offlineReason"]}
            />
          </Section>
          <Section title="Devices">
            <ResourceTable
              rows={rowsFromPayload(data.devices)}
              columns={["id", "platform", "model", "status", "lastSeenAt", "createdAt"]}
            />
          </Section>
          <Section title="Sessions">
            <ResourceTable
              rows={rowsFromPayload(data.sessions)}
              columns={["id", "deviceBindingId", "createdAt", "expiresAt", "revokedAt"]}
            />
          </Section>
        </>
      ) : null}
    </main>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
