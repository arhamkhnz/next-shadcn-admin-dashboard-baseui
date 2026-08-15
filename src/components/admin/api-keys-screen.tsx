"use client";

import { type FormEvent, useMemo, useState } from "react";

import { Activity, CalendarClock, Clock3, Copy, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CUSTOMERS_API_ENDPOINT } from "@/lib/api/customer-query";
import { formatResourceValue } from "@/lib/display";

import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

const apiKeysEndpoint = "/api/backend/operations/platform/api-keys?limit=200";

type Customer = { id: string; firstName?: string; lastName?: string; mobile?: string; email?: string };
type ApiKeyRecord = {
  id: string;
  name?: string;
  source?: string;
  keyPrefix?: string;
  userId: string;
  status?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt?: string;
  createdBy?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load API key data.");
  return body;
};

export function ApiKeysScreen() {
  const [message, setMessage] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: customerPayload } = useSWR<{ data?: Customer[] }>(CUSTOMERS_API_ENDPOINT, fetcher, {
    revalidateOnFocus: false,
  });
  const {
    data: keys = [],
    isValidating,
    mutate: refreshKeys,
  } = useSWR<ApiKeyRecord[]>(apiKeysEndpoint, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const customers = customerPayload?.data ?? [];
  const customerNames = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customerLabel(customer)])),
    [customers],
  );
  const metrics = useMemo(() => {
    const now = Date.now();
    return {
      active: keys.filter((key) => statusForKey(key) === "ACTIVE").length,
      expired: keys.filter((key) => statusForKey(key) === "EXPIRED").length,
      neverUsed: keys.filter((key) => !key.lastUsedAt).length,
      expiringSoon: keys.filter((key) => {
        if (!key.expiresAt) return false;
        const expiresAt = new Date(key.expiresAt).getTime();
        return expiresAt > now && expiresAt <= now + 1000 * 60 * 60 * 24 * 14;
      }).length,
    };
  }, [keys]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setMessage("");
    setGeneratedKey("");
    const form = new FormData(formElement);
    const expiresAt = String(form.get("expiresAt") ?? "");
    const body = {
      name: String(form.get("name") ?? "").trim(),
      userId: String(form.get("userId") ?? ""),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };
    const response = await fetch("/api/backend/operations/platform/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(result.message ?? "API key could not be created.");
      return;
    }
    setGeneratedKey(String(result.key ?? ""));
    setMessage("API key created. Copy it now; it will not be shown again.");
    formElement.reset();
    await mutate(apiKeysEndpoint);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="API keys"
        description="Create partner API keys, monitor ownership, expiry, and usage separately from platform settings."
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-5" />
                  Create API key
                </CardTitle>
                <CardDescription>Assign each key to an owner and optional expiry date.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => refreshKeys()} disabled={isValidating}>
                <RefreshCw className={isValidating ? "animate-spin" : ""} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <form className="grid gap-4" onSubmit={submit}>
              <Field label="Key name" name="name" placeholder="Delivery integration" required />
              <div className="space-y-2">
                <Label htmlFor="userId">Owner account</Label>
                <NativeSelect id="userId" name="userId" required className="w-full">
                  <NativeSelectOption value="">Select an owner</NativeSelectOption>
                  {customers.map((customer) => (
                    <NativeSelectOption key={customer.id} value={customer.id}>
                      {customerLabel(customer)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Field label="Expires at" name="expiresAt" type="datetime-local" />
              <p className="text-muted-foreground text-sm" role="status">
                {message || "Keys are hashed at rest. The generated secret is revealed once."}
              </p>
              <Button type="submit" disabled={saving} className="w-full justify-center">
                <KeyRound />
                {saving ? "Creating..." : "Create API key"}
              </Button>
            </form>
            {generatedKey ? (
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-2 font-medium text-sm">Generated secret</div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all rounded-md bg-background px-2 py-1 font-mono text-sm">{generatedKey}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(generatedKey)}
                  >
                    <Copy />
                    Copy
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<ShieldCheck className="size-4" />} label="Active keys" value={metrics.active} />
          <Metric icon={<CalendarClock className="size-4" />} label="Expiring soon" value={metrics.expiringSoon} />
          <Metric icon={<Clock3 className="size-4" />} label="Never used" value={metrics.neverUsed} />
          <Metric icon={<Activity className="size-4" />} label="Expired keys" value={metrics.expired} />
        </section>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>API activity tracking</CardTitle>
          <CardDescription>
            Review every key separately with prefix, owner, expiry, creator, and last use.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid gap-3">
            {keys.map((key) => (
              <article
                className="grid gap-4 rounded-xl border bg-muted/10 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]"
                key={key.id}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-medium text-base">{key.name ?? key.source ?? "API key"}</h2>
                    <StatusBadge value={statusForKey(key)} />
                  </div>
                  <p className="truncate font-mono text-muted-foreground text-xs">{key.keyPrefix ?? "Hidden prefix"}</p>
                  <p className="text-muted-foreground text-sm">
                    Owner: <span className="text-foreground">{customerNames.get(key.userId) ?? key.userId}</span>
                  </p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <TrackedField
                    label="Last used"
                    value={formatOptionalDate("lastUsedAt", key.lastUsedAt, "Never used")}
                  />
                  <TrackedField label="Expires" value={formatOptionalDate("expiresAt", key.expiresAt, "No expiry")} />
                  <TrackedField label="Created by" value={key.createdBy ?? "Unknown"} />
                  <TrackedField label="Created" value={formatOptionalDate("createdAt", key.createdAt, "Unknown")} />
                </dl>
              </article>
            ))}
            {keys.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-12 text-center text-muted-foreground text-sm">
                No API keys created yet.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-semibold text-3xl">{value}</div>
    </div>
  );
}

function TrackedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 break-words font-medium text-sm">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  className,
  ...props
}: { label: string; name: string; className?: string } & React.ComponentProps<typeof Input>) {
  const id = useMemo(() => name, [name]);
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} {...props} />
    </div>
  );
}

function statusForKey(key: ApiKeyRecord) {
  if (key.status) return key.status;
  return key.isActive ? "ACTIVE" : "REVOKED";
}

function formatOptionalDate(key: string, value?: string | null, fallback = "—") {
  return value ? formatResourceValue(key, value) : fallback;
}

function customerLabel(customer: Customer) {
  return (
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    customer.email ||
    customer.mobile ||
    customer.id
  );
}
