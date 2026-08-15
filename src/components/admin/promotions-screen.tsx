"use client";

import { type FormEvent, useMemo, useState } from "react";

import { BadgeCheck, Gift, Megaphone, Percent, Save, ShieldAlert, Sparkles, TicketPercent, Users } from "lucide-react";
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

type PromotionConfig = {
  id: string;
  key: string;
  value?: {
    enabled?: boolean;
    code?: string;
    discountPercent?: number;
    usageLimit?: number;
    audience?: string;
  };
};

const campaignPresets = [
  {
    label: "Welcome coupon",
    key: "promotions.campaign.welcome",
    description: "A simple first-trip coupon for new customers.",
    value:
      '{\n  "enabled": true,\n  "code": "WELCOME10",\n  "discountPercent": 10,\n  "usageLimit": 100,\n  "audience": "NEW_CUSTOMERS"\n}',
  },
  {
    label: "Rider incentive",
    key: "promotions.incentive.rider-peak",
    description: "Peak-hour incentive control for active riders.",
    value:
      '{\n  "enabled": true,\n  "code": "PEAKRIDER",\n  "discountPercent": 0,\n  "usageLimit": 250,\n  "audience": "RIDERS"\n}',
  },
  {
    label: "Referral boost",
    key: "promotions.referral.weekend",
    description: "Weekend referral growth campaign with controlled usage.",
    value:
      '{\n  "enabled": true,\n  "code": "REFER25",\n  "discountPercent": 25,\n  "usageLimit": 50,\n  "audience": "REFERRALS"\n}',
  },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load promotion data.");
  return body;
};

export function PromotionsScreen() {
  const [keyValue, setKeyValue] = useState(campaignPresets[0].key);
  const [jsonValue, setJsonValue] = useState(campaignPresets[0].value);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: configurations = [] } = useSWR<PromotionConfig[]>(configurationEndpoint, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const promotions = configurations.filter((configuration) => /^promotions\./i.test(configuration.key));
  const activeCount = promotions.filter((configuration) => configuration.value?.enabled !== false).length;
  const totalLimit = promotions.reduce((sum, configuration) => sum + Number(configuration.value?.usageLimit ?? 0), 0);
  const audiences = new Set(promotions.map((configuration) => configuration.value?.audience).filter(Boolean));
  const selectedPreset = campaignPresets.find((preset) => preset.key === keyValue);
  const jsonState = useMemo(() => {
    try {
      JSON.parse(jsonValue);
      return { valid: true, label: "Ready to publish" };
    } catch {
      return { valid: false, label: "Fix JSON" };
    }
  }, [jsonValue]);

  function applyPreset(preset: (typeof campaignPresets)[number]) {
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
      setMessage("Campaign JSON must be valid before publishing.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/backend/operations/platform/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: keyValue,
        value,
        scope: { domain: "promotions" },
        effectiveFrom: new Date().toISOString(),
        changeReason: form.get("changeReason"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Campaign published." : (body.message ?? "Campaign could not be saved."));
    if (response.ok) await mutate(configurationEndpoint);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Create and control coupon, referral, incentive, and campaign rules."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-heading font-medium text-xl">
                  <Megaphone className="size-5" />
                  Campaign command centre
                </h2>
                <CardDescription>
                  Launch coupons, referrals, and incentives with audited campaign configuration.
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
              {campaignPresets.map((preset) => (
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
                    <Badge variant="outline">{preset.key.includes("incentive") ? "Ops" : "Growth"}</Badge>
                  </span>
                  <span className="mt-2 block text-muted-foreground text-xs">{preset.description}</span>
                </button>
              ))}
            </div>

            <form className="grid content-start gap-4" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="promotionKey">Configuration key</Label>
                  <Input
                    id="promotionKey"
                    value={keyValue}
                    onChange={(event) => setKeyValue(event.target.value)}
                    placeholder="promotions.campaign.code"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    {selectedPreset?.description ?? "Use promotions.type.name for searchable campaign history."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeReason">Change reason</Label>
                  <Input id="changeReason" name="changeReason" placeholder="Operational reason and ticket" required />
                  <p className="text-muted-foreground text-xs">Example: MKT-44 launch welcome campaign.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <InfoTile icon={<TicketPercent />} label="Code" value={previewValue(jsonValue, "code")} />
                <InfoTile icon={<Percent />} label="Discount" value={previewValue(jsonValue, "discount")} />
                <InfoTile icon={<Users />} label="Audience" value={previewValue(jsonValue, "audience")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignJson">Campaign JSON</Label>
                <Textarea
                  id="campaignJson"
                  aria-label="Campaign JSON"
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
                  {message || "Campaign changes are versioned and can be exported from history."}
                </p>
                <Button type="submit" disabled={saving || !jsonState.valid}>
                  <Save />
                  {saving ? "Publishing..." : "Publish campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-3">
          <MetricCard
            label="Campaign versions"
            value={promotions.length}
            helper={`${activeCount} active`}
            icon={<Gift />}
          />
          <MetricCard
            label="Audience groups"
            value={audiences.size}
            helper={[...audiences].join(", ") || "No live config yet"}
            icon={<Users />}
          />
          <MetricCard
            label="Usage budget"
            value={totalLimit}
            helper="Across loaded campaign versions"
            icon={<Sparkles />}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Campaign history</h2>
          <p className="text-muted-foreground text-sm">
            Search campaign versions, export CSV, and review published promotion rules.
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
          emptyMessage="No promotion configuration versions have been published yet."
          exportFilename="promotions"
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

function previewValue(jsonValue: string, kind: "code" | "discount" | "audience") {
  try {
    const value = JSON.parse(jsonValue) as PromotionConfig["value"];
    if (kind === "code") return value?.code || "—";
    if (kind === "discount") return `${value?.discountPercent ?? 0}%`;
    return value?.audience?.replaceAll("_", " ") || "—";
  } catch {
    return "Fix JSON";
  }
}
