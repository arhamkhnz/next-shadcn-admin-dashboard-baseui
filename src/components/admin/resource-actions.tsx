"use client";

import { type FormEvent, useMemo, useState } from "react";

import Link from "next/link";

import { MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { recordLabel } from "@/lib/display";

import {
  isResourceActionAvailable,
  type ResourceAction,
  type ResourceActionField,
  resolveRecordEndpoint,
} from "./resource-types";

export function ResourceActions({
  row,
  actions,
  idKey = "id",
  labelKeys = [],
  onCompleted,
  detailsHref,
}: {
  row: Record<string, unknown>;
  actions: ResourceAction[];
  idKey?: string;
  labelKeys?: string[];
  onCompleted?: () => void | Promise<void>;
  detailsHref?: string;
}) {
  const available = useMemo(() => actions.filter((action) => isResourceActionAvailable(action, row)), [actions, row]);
  const [activeAction, setActiveAction] = useState<ResourceAction>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const label = recordLabel(row, labelKeys);

  if (available.length === 0 && !detailsHref) return null;

  function close() {
    if (submitting) return;
    setActiveAction(undefined);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAction) return;
    setSubmitting(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const fieldBody = Object.fromEntries(
      (activeAction.fields ?? []).map((field) => {
        const value = values.get(field.name);
        if (field.valueType === "boolean") return [field.name, value === "true"];
        if (field.valueType === "number") return [field.name, Number(value)];
        return [field.name, value];
      }),
    );
    const body = { ...(activeAction.body ?? {}), ...fieldBody };

    try {
      const endpoint = resolveRecordEndpoint(activeAction.endpoint, row, idKey);
      const response = await fetch(`/api/backend/${endpoint}`, {
        method: activeAction.method ?? "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message ?? "The action could not be completed.");
      await onCompleted?.();
      toast.add({
        title: activeAction.successMessage ?? `${activeAction.label} completed`,
        description: label,
        type: "success",
      });
      setActiveAction(undefined);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "The action could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  const form = activeAction ? (
    <form className="space-y-4" onSubmit={submit}>
      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground text-xs">Selected record</p>
        <p className="truncate font-medium">{label}</p>
      </div>
      {(activeAction.fields ?? []).map((field) => (
        <ActionFieldInput field={field} key={field.name} />
      ))}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {activeAction.variant === "destructive" ? (
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button type="submit" variant="destructive" disabled={submitting}>
            {submitting ? "Working…" : (activeAction.submitLabel ?? activeAction.label)}
          </Button>
        </AlertDialogFooter>
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Working…" : (activeAction.submitLabel ?? activeAction.label)}
          </Button>
        </DialogFooter>
      )}
    </form>
  ) : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`} className="shrink-0" />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {detailsHref ? <DropdownMenuItem render={<Link href={detailsHref} />}>View details</DropdownMenuItem> : null}
          {available.map((action) => (
            <DropdownMenuItem
              key={action.id}
              className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : undefined}
              onClick={() => {
                setError("");
                setActiveAction(action);
              }}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(activeAction && activeAction.variant !== "destructive")} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeAction?.label}</DialogTitle>
            <DialogDescription>
              {activeAction?.description ??
                `Apply this action to ${label}. The change will be recorded in the audit log.`}
            </DialogDescription>
          </DialogHeader>
          {activeAction?.variant !== "destructive" ? form : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={activeAction?.variant === "destructive"} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{activeAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>
              {activeAction?.description ?? `Confirm this high-impact action for ${label}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {activeAction?.variant === "destructive" ? form : null}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ActionFieldInput({ field }: { field: ResourceActionField }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`resource-action-${field.name}`}>{field.label}</Label>
      {field.options ? (
        <NativeSelect
          id={`resource-action-${field.name}`}
          name={field.name}
          required={field.required ?? true}
          className="w-full"
        >
          {field.options.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/^./, (character) => character.toUpperCase())}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ) : (
        <Input
          id={`resource-action-${field.name}`}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required ?? true}
        />
      )}
    </div>
  );
}
