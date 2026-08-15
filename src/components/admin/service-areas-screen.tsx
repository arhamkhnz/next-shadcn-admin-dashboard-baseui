"use client";

import { type FormEvent, useMemo, useState } from "react";

import { BadgeCheck, Clock3, FileJson, MapPinHouse, Route, Save, ShieldAlert, Truck, Users } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

const configurationEndpoint = "/api/backend/operations/platform/configurations?limit=200";

type ServiceAreaConfig = {
  id: string;
  key: string;
  value?: {
    enabled?: boolean;
    vehicleTypes?: string[];
    operatingHours?: { start?: string; end?: string };
    capacity?: { maxActiveDrivers?: number };
  };
};

const serviceAreaPresets = [
  {
    label: "Jaipur core",
    key: "serviceArea.jaipur.core",
    description: "High-demand passenger and delivery coverage across central Jaipur.",
    value:
      '{\n  "enabled": true,\n  "vehicleTypes": ["BIKE", "AUTO"],\n  "operatingHours": { "start": "06:00", "end": "23:00" },\n  "capacity": { "maxActiveDrivers": 120 }\n}',
  },
  {
    label: "Airport logistics",
    key: "serviceArea.jaipur.airport",
    description: "Airport transfer and courier coverage with tighter driver availability.",
    value:
      '{\n  "enabled": true,\n  "vehicleTypes": ["BIKE", "AIRPORT_TRANSFER"],\n  "operatingHours": { "start": "05:00", "end": "23:30" },\n  "capacity": { "maxActiveDrivers": 40 }\n}',
  },
  {
    label: "Night pause",
    key: "serviceArea.jaipur.night-pause",
    description: "Disable new bookings overnight while preserving visibility for existing work.",
    value:
      '{\n  "enabled": false,\n  "vehicleTypes": ["BIKE"],\n  "operatingHours": { "start": "23:30", "end": "05:00" },\n  "capacity": { "maxActiveDrivers": 0 }\n}',
  },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load service area data.");
  return body;
};

export function ServiceAreasScreen() {
  const [keyValue, setKeyValue] = useState(serviceAreaPresets[0].key);
  const [jsonValue, setJsonValue] = useState(serviceAreaPresets[0].value);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: configurations = [] } = useSWR<ServiceAreaConfig[]>(configurationEndpoint, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const serviceAreas = configurations.filter((configuration) => /^serviceArea\./i.test(configuration.key));
  const enabledCount = serviceAreas.filter((configuration) => configuration.value?.enabled !== false).length;
  const vehicleTypes = new Set(serviceAreas.flatMap((configuration) => configuration.value?.vehicleTypes ?? []));
  const capacity = serviceAreas.reduce(
    (sum, configuration) => sum + Number(configuration.value?.capacity?.maxActiveDrivers ?? 0),
    0,
  );
  const selectedPreset = serviceAreaPresets.find((preset) => preset.key === keyValue);
  const jsonState = useMemo(() => {
    try {
      JSON.parse(jsonValue);
      return { valid: true, label: "Ready to publish" };
    } catch {
      return { valid: false, label: "Fix JSON" };
    }
  }, [jsonValue]);

  function applyPreset(preset: (typeof serviceAreaPresets)[number]) {
    setKeyValue(preset.key);
    setJsonValue(preset.value);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    let value: Record<string, unknown>;
    try {
      value = JSON.parse(jsonValue);
    } catch {
      setSaving(false);
      setMessage("Zone JSON must be valid before publishing.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/backend/operations/platform/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: keyValue,
        value,
        scope: { domain: "service-area" },
        effectiveFrom: new Date().toISOString(),
        changeReason: form.get("changeReason"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Service area update published." : (body.message ?? "Service area could not be saved."));
    if (response.ok) await mutate(configurationEndpoint);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Service areas"
        description="Control zones, geofences, vehicle availability, capacity, and operating hours."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-heading font-medium text-xl">
                  <MapPinHouse className="size-5" />
                  Zone command centre
                </h2>
                <CardDescription>
                  Choose a zone template, review the operating window, then publish an audited version.
                </CardDescription>
              </div>
              <Badge variant={jsonState.valid ? "outline" : "destructive"}>
                {jsonState.valid ? <BadgeCheck /> : <ShieldAlert />}
                {jsonState.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-3">
              {serviceAreaPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.key}
                  aria-label={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted/30 ${
                    keyValue === preset.key ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium">{preset.label}</span>
                    <Badge variant={preset.value.includes('"enabled": false') ? "secondary" : "outline"}>
                      {preset.value.includes('"enabled": false') ? "Paused" : "Live"}
                    </Badge>
                  </span>
                  <span className="mt-2 block text-muted-foreground text-xs">{preset.description}</span>
                </button>
              ))}
            </div>

            <form className="grid content-start gap-4" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceAreaKey">Configuration key</Label>
                  <Input
                    id="serviceAreaKey"
                    value={keyValue}
                    onChange={(event) => setKeyValue(event.target.value)}
                    placeholder="serviceArea.jaipur.zone"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    {selectedPreset?.description ?? "Use serviceArea.city.zone naming for searchable history."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeReason">Change reason</Label>
                  <Input id="changeReason" name="changeReason" placeholder="Operational reason and ticket" required />
                  <p className="text-muted-foreground text-xs">Example: OPS-91 increase airport coverage.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <InfoTile icon={<Clock3 />} label="Hours" value={previewValue(jsonValue, "hours")} />
                <InfoTile icon={<Truck />} label="Vehicles" value={previewValue(jsonValue, "vehicles")} />
                <InfoTile icon={<Users />} label="Capacity" value={previewValue(jsonValue, "capacity")} />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="zoneJson">Zone JSON</Label>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <FileJson className="size-3" />
                    Versioned configuration
                  </span>
                </div>
                <Textarea
                  id="zoneJson"
                  aria-label="Zone JSON"
                  value={jsonValue}
                  onChange={(event) => setJsonValue(event.target.value)}
                  rows={10}
                  required
                  aria-invalid={!jsonState.valid}
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm" role="status">
                  {message || "This publishes a new audited service-area version."}
                </p>
                <Button type="submit" disabled={saving || !jsonState.valid}>
                  <Save />
                  {saving ? "Publishing..." : "Publish zone update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-3">
          <MetricCard
            label="Configured zones"
            value={serviceAreas.length}
            helper={`${enabledCount} enabled`}
            icon={<Route />}
          />
          <MetricCard
            label="Vehicle types"
            value={vehicleTypes.size}
            helper={[...vehicleTypes].join(", ") || "No live config yet"}
            icon={<Truck />}
          />
          <MetricCard label="Driver capacity" value={capacity} helper="Across loaded zone versions" icon={<Users />} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Service-area history</h2>
          <p className="text-muted-foreground text-sm">
            Search published zone versions, export CSV, and compare operational changes.
          </p>
        </div>
        <OperationsResource
          endpoint="operations/platform/configurations?limit=200"
          columns={[
            "key",
            "version",
            "value",
            "scope",
            "effectiveFrom",
            "effectiveTo",
            "changeReason",
            "createdBy",
            "createdAt",
          ]}
          emptyMessage="No service-area configuration versions have been published yet."
          exportFilename="service-areas"
        />
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 font-semibold text-3xl tabular-nums">{value}</p>
          <p className="mt-1 truncate text-muted-foreground text-xs">{helper}</p>
        </div>
        <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>
      </CardContent>
    </Card>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="[&_svg]:size-3.5">{icon}</span>
        {label}
      </div>
      <div className="mt-1 truncate font-medium text-sm">{value}</div>
    </div>
  );
}

function previewValue(jsonValue: string, kind: "hours" | "vehicles" | "capacity") {
  try {
    const value = JSON.parse(jsonValue) as ServiceAreaConfig["value"];
    if (kind === "hours") return `${value?.operatingHours?.start ?? "—"} – ${value?.operatingHours?.end ?? "—"}`;
    if (kind === "vehicles") return value?.vehicleTypes?.join(", ") || "—";
    return String(value?.capacity?.maxActiveDrivers ?? "—");
  } catch {
    return "Fix JSON";
  }
}
