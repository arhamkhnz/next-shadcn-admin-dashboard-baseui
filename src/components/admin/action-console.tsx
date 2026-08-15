"use client";

import { type FormEvent, useState } from "react";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export type ActionField = {
  name: string;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  valueType?: "string" | "boolean" | "number";
};
export function ActionConsole({
  title,
  description,
  endpoint,
  method = "POST",
  fields = [],
  fixedId,
  submitLabel = "Apply action",
}: {
  title: string;
  description: string;
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  fields?: ActionField[];
  fixedId?: string;
  submitLabel?: string;
}) {
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    setMessage("");
    const values = new FormData(event.currentTarget);
    const id = fixedId ?? String(values.get("id"));
    const body = Object.fromEntries(
      fields.map((field) => {
        const value = values.get(field.name);
        if (field.valueType === "boolean") return [field.name, value === "true"];
        if (field.valueType === "number") return [field.name, Number(value)];
        return [field.name, value];
      }),
    );
    const response = await fetch(`/api/backend/${endpoint.replace("{id}", encodeURIComponent(id))}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    setRunning(false);
    setMessage(response.ok ? "Action completed successfully." : (result.message ?? "Action failed."));
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          {fixedId ? null : (
            <ActionInput field={{ name: "id", label: "Record ID", placeholder: "UUID", required: true }} />
          )}
          {fields.map((field) => (
            <ActionInput field={field} key={field.name} />
          ))}
          <div className="flex items-center justify-between gap-4 md:col-span-2">
            <p className="text-muted-foreground text-sm" role="status">
              {message}
            </p>
            <Button type="submit" disabled={running}>
              <Play />
              {running ? "Working…" : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function ActionInput({ field }: { field: ActionField }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${field.name}-${field.label}`}>{field.label}</Label>
      {field.options ? (
        <NativeSelect
          id={`${field.name}-${field.label}`}
          name={field.name}
          required={field.required ?? true}
          className="w-full"
        >
          {field.options.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option.replaceAll("_", " ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ) : (
        <Input
          id={`${field.name}-${field.label}`}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required ?? true}
        />
      )}
    </div>
  );
}
