"use client";

import { useState } from "react";

import { Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { recordLabel } from "@/lib/display";

type DocumentFileActionsProps = {
  document: Record<string, unknown>;
  labelKeys?: string[];
};

export function DocumentFileActions({ document, labelKeys = ["type", "documentType"] }: DocumentFileActionsProps) {
  const [busyAction, setBusyAction] = useState<"preview" | "download" | null>(null);
  const label = recordLabel(document, labelKeys);
  const documentId = document.id ?? document.documentId;
  const disabled = !documentId || busyAction !== null;

  async function signedUrl() {
    if (!documentId) throw new Error("This document is missing an ID, so a secure preview URL cannot be created.");
    const response = await fetch(
      `/api/backend/drivers/verification/documents/${encodeURIComponent(String(documentId))}/url`,
      {
        cache: "no-store",
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.url) throw new Error(body.message ?? "Could not create a document preview URL.");
    return String(body.url);
  }

  async function preview() {
    setBusyAction("preview");
    try {
      window.open(await signedUrl(), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.add({
        title: "Document preview unavailable",
        description: error instanceof Error ? error.message : "Could not open this document.",
        type: "error",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function download() {
    setBusyAction("download");
    try {
      const anchor = window.document.createElement("a");
      anchor.href = await signedUrl();
      anchor.download = filenameFor(label);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      window.document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      toast.add({
        title: "Document download unavailable",
        description: error instanceof Error ? error.message : "Could not download this document.",
        type: "error",
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={preview}
        disabled={disabled}
        aria-label={`Preview ${label}`}
      >
        <ExternalLink />
        Preview
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={download}
        disabled={disabled}
        aria-label={`Download ${label}`}
      >
        <Download />
        Download
      </Button>
    </div>
  );
}

function filenameFor(label: string) {
  return `${
    label
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "") || "document"
  }`;
}
