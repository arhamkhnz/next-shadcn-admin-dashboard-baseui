"use client";

import { type FormEvent, useMemo, useState } from "react";

import { BadgeCheck, CalendarClock, FileJson, Save, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useSWRConfig } from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

const endpoint = "/api/backend/operations/platform/configurations?limit=200";
const presets = [
  {
    label: "Dispatch timeout",
    key: "dispatch.offer.timeout",
    value: '{\n  "seconds": 20\n}',
    description: "How long a rider offer stays open before reassignment.",
  },
  {
    label: "Feature flags",
    key: "feature-flags",
    value: '{\n  "deliveryOrders": true,\n  "liveFleetMap": true\n}',
    description: "Turn platform modules on or off without redeploying.",
  },
  {
    label: "Support SLA",
    key: "support.first_response.sla",
    value: '{\n  "minutes": 15,\n  "priority": "HIGH"\n}',
    description: "Controls first-response targets for open support queues.",
  },
  {
    label: "Rider payouts",
    key: "payout.batch.policy",
    value: '{\n  "dailyCutoffHour": 18,\n  "minimumPaise": 10000\n}',
    description: "Requires approval because payout keys are sensitive.",
  },
];

export function ConfigurationScreen({
  title,
  description,
  keyPlaceholder,
  example,
}: {
  title: string;
  description: string;
  keyPlaceholder: string;
  example: string;
}) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [jsonValue, setJsonValue] = useState(example);
  const [effectiveTo, setEffectiveTo] = useState("");
  const { mutate } = useSWRConfig();
  const jsonState = useMemo(() => {
    try {
      JSON.parse(jsonValue);
      return { valid: true, label: "Valid JSON" };
    } catch {
      return { valid: false, label: "Invalid JSON" };
    }
  }, [jsonValue]);
  const selectedPreset = presets.find((preset) => preset.key === keyValue);

  function applyPreset(preset: (typeof presets)[number]) {
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
      setMessage("Configuration value must be valid JSON.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/backend/operations/platform/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: keyValue,
        value,
        scope: {},
        effectiveFrom: new Date().toISOString(),
        effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : undefined,
        changeReason: form.get("changeReason"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      response.ok ? "Configuration saved or sent for approval." : (body.message ?? "Configuration could not be saved."),
    );
    if (response.ok) await mutate(endpoint);
  }

  return (
    <main className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Known controls</CardTitle>
            <CardDescription>Start with a safe preset, then adjust the JSON before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {presets.map((preset) => (
              <button
                type="button"
                aria-label={preset.label}
                className={`w-full rounded-lg border p-3 text-left transition-colors hover:border-foreground/25 hover:bg-muted/30 ${
                  preset.key === keyValue ? "border-primary bg-primary/5" : ""
                }`}
                key={preset.key}
                onClick={() => applyPreset(preset)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium">{preset.label}</span>
                  {/(payout|pricing|disciplinary)/i.test(preset.key) ? (
                    <Badge variant="destructive">Approval</Badge>
                  ) : (
                    <Badge variant="outline">Live</Badge>
                  )}
                </span>
                <span className="mt-1 block text-muted-foreground text-xs">{preset.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading font-medium text-base leading-snug">Publish configuration</h2>
                <CardDescription>
                  Versioned changes are audited. Sensitive pricing and payout keys enter the approval queue.
                </CardDescription>
              </div>
              <Badge variant={jsonState.valid ? "outline" : "destructive"}>
                {jsonState.valid ? <BadgeCheck /> : <ShieldAlert />}
                {jsonState.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="key">Configuration key</Label>
                <Input
                  id="key"
                  name="key"
                  placeholder={keyPlaceholder}
                  required
                  value={keyValue}
                  onChange={(event) => setKeyValue(event.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  {selectedPreset?.description ?? "Use dotted names such as dispatch.offer.timeout."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="changeReason">Change reason</Label>
                <Input id="changeReason" name="changeReason" placeholder="Operational reason and ticket" required />
                <p className="text-muted-foreground text-xs">Add a ticket, incident, or approval context.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective to</Label>
                <Input
                  id="effectiveTo"
                  name="effectiveTo"
                  type="datetime-local"
                  value={effectiveTo}
                  onChange={(event) => setEffectiveTo(event.target.value)}
                />
                <p className="flex items-center gap-1 text-muted-foreground text-xs">
                  <CalendarClock className="size-3" />
                  Leave empty for an open-ended version.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <SlidersHorizontal className="size-4" />
                  Change impact
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Payout, pricing, rate, and disciplinary keys are routed to approval before they go live.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="value">JSON value</Label>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <FileJson className="size-3" />
                    Stored as versioned JSON
                  </span>
                </div>
                <Textarea
                  id="value"
                  name="value"
                  value={jsonValue}
                  onChange={(event) => setJsonValue(event.target.value)}
                  rows={9}
                  required
                  className="font-mono text-xs"
                  aria-invalid={!jsonState.valid}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
                <p className="text-muted-foreground text-sm" role="status">
                  {message || "Review the key, JSON, and expiry window before publishing."}
                </p>
                <Button type="submit" disabled={saving || !jsonState.valid}>
                  <Save />
                  {saving ? "Saving..." : "Publish configuration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">Configuration history</h2>
            <p className="text-muted-foreground text-sm">
              Search versions, compare values, and switch list/grid layout per browser.
            </p>
          </div>
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
          emptyMessage="No configuration versions have been published yet."
        />
      </div>
    </main>
  );
}
