"use client";

import { type FormEvent, useState } from "react";

import { AlertCircle, Save } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { compactId, formatResourceValue, rowsFromPayload, titleFromKey } from "@/lib/display";

import { DocumentFileActions } from "./document-file-actions";
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
    `/api/backend/operations/platform/riders/${safe}/locations?reasonCode=ADMIN_DRIVER_REVIEW&limit=50`,
    fetcher,
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function changeState(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/backend/operations/platform/riders/${safe}/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: form.get("state"), reasonCode: form.get("reasonCode"), note: form.get("note") }),
    });
    const body = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      setMessage(body.message ?? "State update failed.");
      return;
    }
    setMessage("Driver state updated or sent for approval.");
    toast.add({ title: "Driver state updated", description: data?.rider.personal.fullName, type: "success" });
    await mutate();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title={data?.rider?.personal?.fullName ?? "Driver details"}
        description={`Operational profile ${compactId(riderId)}. Location-history access is recorded in the audit log.`}
      />
      {isLoading ? <Skeleton className="h-96" /> : null}
      {!isLoading && error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Driver unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}
      {!isLoading && !error && data ? (
        <Tabs defaultValue="overview" className="min-w-0 gap-4">
          <div className="overflow-x-auto pb-1">
            <TabsList variant="line" className="min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="access">Access activity</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Account and vehicle</CardTitle>
                      <CardDescription>Readable identity, operating, and compliance information.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={data.rider.state} />
                      <StatusBadge value={data.rider.onboardingState} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoSection
                    title="Personal"
                    values={{
                      mobile: data.rider.mobile,
                      dateOfBirth: data.rider.personal.dateOfBirth,
                      currentAddress: data.rider.personal.currentAddress,
                      operatingLocality: data.rider.personal.operatingLocality,
                      primaryZoneId: data.rider.personal.primaryZoneId,
                      preferredLanguage: data.rider.personal.preferredLanguage,
                    }}
                  />
                  <InfoSection title="Vehicle" values={data.rider.vehicle} />
                  <InfoSection title="Compliance" values={data.rider.compliance ?? {}} />
                  <InfoSection
                    title="Record"
                    values={{ createdAt: data.rider.createdAt, updatedAt: data.rider.updatedAt }}
                  />
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Change driver state</CardTitle>
                  <CardDescription>
                    The selected driver is applied automatically. Deactivation requires approval.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changeState} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">New state</Label>
                      <NativeSelect id="state" name="state" className="w-full">
                        <NativeSelectOption value="ACTIVE_OFFLINE">Active offline</NativeSelectOption>
                        <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
                        <NativeSelectOption value="DEACTIVATED">Deactivated (approval)</NativeSelectOption>
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reasonCode">Reason</Label>
                      <Input
                        id="reasonCode"
                        name="reasonCode"
                        required
                        placeholder="Reference the support or compliance case"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Internal note</Label>
                      <Input id="note" name="note" required placeholder="Explain why this change is required" />
                    </div>
                    {message ? (
                      <p
                        className={
                          message.includes("failed") ? "text-destructive text-sm" : "text-muted-foreground text-sm"
                        }
                        role="status"
                      >
                        {message}
                      </p>
                    ) : null}
                    <Button type="submit" disabled={submitting}>
                      <Save />
                      {submitting ? "Applying…" : "Apply state change"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Section
              title="Uploaded documents"
              description="Review document type, verification state, and latest review time."
            >
              <ResourceTable
                rows={rowsFromPayload(data.documents)}
                columns={["type", "status", "reviewedAt", "updatedAt", "storageKey"]}
                labelKeys={["type"]}
                emptyMessage="No documents have been uploaded for this driver."
                renderRowActions={(document) => <DocumentFileActions document={document} />}
              />
            </Section>
          </TabsContent>

          <TabsContent value="location">
            <Section
              title="Location history"
              description="The latest 50 recorded samples. This sensitive read is included in the audit log."
            >
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
                labelKeys={["capturedAt"]}
                emptyMessage="No location samples have been recorded for this driver."
              />
            </Section>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Section title="Availability" description="The latest online or offline availability session.">
              <ResourceTable
                rows={data.availability ? [data.availability] : []}
                columns={["zoneId", "startedAt", "endedAt", "offlineReason"]}
                labelKeys={["zoneId"]}
                emptyMessage="No availability session has been recorded."
              />
            </Section>
            <div className="grid gap-4 xl:grid-cols-2">
              <Section title="Devices" description="Registered devices and their last activity.">
                <ResourceTable
                  rows={rowsFromPayload(data.devices)}
                  columns={["model", "platform", "status", "lastSeenAt", "createdAt"]}
                  labelKeys={["model", "platform"]}
                  emptyMessage="No devices are registered."
                />
              </Section>
              <Section title="Sessions" description="Recent authenticated driver sessions.">
                <ResourceTable
                  rows={rowsFromPayload(data.sessions)}
                  columns={["createdAt", "expiresAt", "revokedAt", "deviceBindingId"]}
                  labelKeys={["createdAt"]}
                  emptyMessage="No sessions have been recorded."
                />
              </Section>
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </main>
  );
}

function InfoSection({ title, values }: { title: string; values: Record<string, unknown> }) {
  const entries = Object.entries(values).filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (entries.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-medium text-sm">{title}</h3>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div className="min-w-0" key={key}>
            <dt className="text-muted-foreground text-xs">{titleFromKey(key)}</dt>
            <dd className="mt-1 break-words text-sm">{formatResourceValue(key, value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
