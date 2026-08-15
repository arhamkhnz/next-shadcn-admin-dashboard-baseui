"use client";

import { type FormEvent, useState } from "react";

import { Save } from "lucide-react";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

const endpoint = "/api/backend/operations/platform/configurations?limit=200";
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
    if (response.ok) await mutate(endpoint);
  }
  return (
    <main className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Publish configuration</CardTitle>
          <CardDescription>
            Versioned changes are audited. Sensitive pricing and payout keys enter the approval queue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="key">Configuration key</Label>
              <Input id="key" name="key" placeholder={keyPlaceholder} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeReason">Change reason</Label>
              <Input id="changeReason" name="changeReason" placeholder="Operational reason and ticket" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="value">JSON value</Label>
              <Textarea
                id="value"
                name="value"
                defaultValue={example}
                rows={6}
                required
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between gap-4 md:col-span-2">
              <p className="text-muted-foreground text-sm" role="status">
                {message}
              </p>
              <Button type="submit" disabled={saving}>
                <Save />
                {saving ? "Saving…" : "Publish"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
      />
    </main>
  );
}
