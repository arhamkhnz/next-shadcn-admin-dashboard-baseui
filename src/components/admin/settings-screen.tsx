"use client";

import { type FormEvent, useMemo, useState } from "react";

import { Save } from "lucide-react";
import { useSWRConfig } from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

const configurationEndpoint = "/api/backend/operations/platform/configurations?limit=200";

export function SettingsScreen() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Settings"
        description="Secure global controls for dispatch, operations, support, safety, and integrations."
      />
      <div className="grid gap-4">
        <ConfigurationPublishPanel />
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
    </main>
  );
}

function ConfigurationPublishPanel() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    let value: Record<string, unknown>;
    try {
      value = JSON.parse(String(form.get("value")));
    } catch {
      setSaving(false);
      setMessage("Configuration value must be valid JSON.");
      return;
    }
    const response = await fetch("/api/backend/operations/platform/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: form.get("key"),
        value,
        scope: {},
        effectiveFrom: new Date().toISOString(),
        changeReason: form.get("changeReason"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      response.ok ? "Configuration saved or sent for approval." : (body.message ?? "Configuration could not be saved."),
    );
    if (response.ok) await mutate(configurationEndpoint);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Publish configuration</CardTitle>
            <CardDescription>Versioned global settings with approvals for pricing and payout changes.</CardDescription>
          </div>
          <Badge variant="outline">Audited</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Configuration key" name="key" placeholder="platform.feature.name" required />
            <Field label="Change reason" name="changeReason" placeholder="Operational reason and ticket" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">JSON value</Label>
            <Textarea
              id="value"
              name="value"
              defaultValue={'{\n  "enabled": true\n}'}
              rows={7}
              required
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm" role="status">
              {message || "Sensitive keys go into the approval queue before they take effect."}
            </p>
            <Button type="submit" disabled={saving}>
              <Save />
              {saving ? "Saving..." : "Publish"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
