"use client";

import { type FormEvent, useMemo, useState } from "react";

import {
  BadgeCheck,
  BellRing,
  Megaphone,
  MessageSquareText,
  Radio,
  Save,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
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

type NotificationConfig = {
  id: string;
  key: string;
  value?: {
    enabled?: boolean;
    title?: string;
    message?: string;
    channel?: string;
    audience?: string;
  };
};

const notificationPresets = [
  {
    label: "Service delay alert",
    key: "notifications.announcement.service-delay",
    description: "Customer-facing operations update during surge, weather, or dispatch delays.",
    value:
      '{\n  "enabled": true,\n  "title": "Service delay",\n  "message": "Pickup times may be longer than usual.",\n  "channel": "PUSH",\n  "audience": "CUSTOMERS"\n}',
  },
  {
    label: "Driver onboarding",
    key: "notifications.template.driver-onboarding",
    description: "Driver reminder to complete documents and become dispatch-ready.",
    value:
      '{\n  "enabled": true,\n  "title": "Complete your documents",\n  "message": "Upload your required documents to start receiving trips.",\n  "channel": "PUSH",\n  "audience": "DRIVERS"\n}',
  },
  {
    label: "Partner order update",
    key: "notifications.routing.partner-order-update",
    description: "Partner delivery updates for assignment, pickup, and drop milestones.",
    value:
      '{\n  "enabled": true,\n  "title": "Order status update",\n  "message": "Your delivery order has a new status.",\n  "channel": "WEBHOOK",\n  "audience": "PARTNERS"\n}',
  },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load notification data.");
  return body;
};

export function NotificationsScreen() {
  const [keyValue, setKeyValue] = useState(notificationPresets[0].key);
  const [jsonValue, setJsonValue] = useState(notificationPresets[0].value);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: configurations = [] } = useSWR<NotificationConfig[]>(configurationEndpoint, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const notifications = configurations.filter((configuration) => /^notifications\./i.test(configuration.key));
  const activeCount = notifications.filter((configuration) => configuration.value?.enabled !== false).length;
  const channels = new Set(notifications.map((configuration) => configuration.value?.channel).filter(Boolean));
  const audiences = new Set(notifications.map((configuration) => configuration.value?.audience).filter(Boolean));
  const selectedPreset = notificationPresets.find((preset) => preset.key === keyValue);
  const jsonState = useMemo(() => {
    try {
      JSON.parse(jsonValue);
      return { valid: true, label: "Ready to publish" };
    } catch {
      return { valid: false, label: "Fix JSON" };
    }
  }, [jsonValue]);

  function applyPreset(preset: (typeof notificationPresets)[number]) {
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
      setMessage("Notification JSON must be valid before publishing.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/backend/operations/platform/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: keyValue,
        value,
        scope: { domain: "notifications" },
        effectiveFrom: new Date().toISOString(),
        changeReason: form.get("changeReason"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Notification control published." : (body.message ?? "Notification could not be saved."));
    if (response.ok) await mutate(configurationEndpoint);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage operational announcements, routing rules, templates, and notification controls."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-heading font-medium text-xl">
                  <BellRing className="size-5" />
                  Notification command centre
                </h2>
                <CardDescription>
                  Publish announcements, driver nudges, and partner routing messages with clear preview context.
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
              {notificationPresets.map((preset) => (
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
                    <Badge variant="outline">{preset.key.includes("routing") ? "Routing" : "Template"}</Badge>
                  </span>
                  <span className="mt-2 block text-muted-foreground text-xs">{preset.description}</span>
                </button>
              ))}
            </div>

            <form className="grid content-start gap-4" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="notificationKey">Configuration key</Label>
                  <Input
                    id="notificationKey"
                    value={keyValue}
                    onChange={(event) => setKeyValue(event.target.value)}
                    placeholder="notifications.announcement.active"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    {selectedPreset?.description ?? "Use notifications.type.name for searchable history."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeReason">Change reason</Label>
                  <Input id="changeReason" name="changeReason" placeholder="Operational reason and ticket" required />
                  <p className="text-muted-foreground text-xs">Example: OPS-31 update service delay copy.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <InfoTile icon={<MessageSquareText />} label="Title" value={previewValue(jsonValue, "title")} />
                <InfoTile icon={<Radio />} label="Channel" value={previewValue(jsonValue, "channel")} />
                <InfoTile icon={<Users />} label="Audience" value={previewValue(jsonValue, "audience")} />
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground text-xs">
                  <Send className="size-3.5" />
                  Message preview
                </div>
                <p className="font-medium">{previewValue(jsonValue, "title")}</p>
                <p className="mt-1 text-muted-foreground text-sm">{previewValue(jsonValue, "message")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationJson">Notification JSON</Label>
                <Textarea
                  id="notificationJson"
                  aria-label="Notification JSON"
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
                  {message || "Notification changes are versioned and auditable."}
                </p>
                <Button type="submit" disabled={saving || !jsonState.valid}>
                  <Save />
                  {saving ? "Publishing..." : "Publish notification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-3">
          <MetricCard
            label="Notification versions"
            value={notifications.length}
            helper={`${activeCount} active`}
            icon={<Megaphone />}
          />
          <MetricCard
            label="Channels"
            value={channels.size}
            helper={[...channels].join(", ") || "No live config yet"}
            icon={<Radio />}
          />
          <MetricCard
            label="Audiences"
            value={audiences.size}
            helper={[...audiences].join(", ") || "No live config yet"}
            icon={<Users />}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Notification history</h2>
          <p className="text-muted-foreground text-sm">
            Search notification versions, export CSV, and review published messaging controls.
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
          emptyMessage="No notification configuration versions have been published yet."
          exportFilename="notifications"
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

function previewValue(jsonValue: string, kind: "title" | "message" | "channel" | "audience") {
  try {
    const value = JSON.parse(jsonValue) as NotificationConfig["value"];
    if (kind === "title") return value?.title || "Untitled";
    if (kind === "message") return value?.message || "No message body";
    if (kind === "channel") return value?.channel || "—";
    return value?.audience?.replaceAll("_", " ") || "—";
  } catch {
    return "Fix JSON";
  }
}
