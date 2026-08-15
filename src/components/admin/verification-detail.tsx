"use client";

import { Check, ExternalLink, ShieldCheck, X } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayValue } from "@/lib/display";

import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

type DocumentRecord = {
  id: string;
  documentType: string;
  side?: string;
  status: string;
  note?: string;
  rejectionReason?: string;
  expiryDate?: string;
  createdAt: string;
  verifiedAt?: string;
};
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });

export function VerificationDetail({ driverId }: { driverId: string }) {
  const safe = encodeURIComponent(driverId);
  const endpoint = `/api/backend/drivers/verification/${safe}/documents`;
  const { data = [], error, isLoading, mutate } = useSWR<DocumentRecord[]>(endpoint, fetcher);
  async function mutateDocument(documentId: string, action: "approve" | "reject") {
    let body: string | undefined;
    if (action === "reject") {
      const reason = window.prompt("Enter the specific rejection reason shown to the driver:");
      if (!reason?.trim()) return;
      body = JSON.stringify({ reason: reason.trim() });
    }
    const response = await fetch(
      `/api/backend/drivers/verification/documents/${encodeURIComponent(documentId)}/${action}`,
      { method: "PATCH", headers: body ? { "Content-Type": "application/json" } : undefined, body },
    );
    if (response.ok) await mutate();
  }
  async function view(documentId: string) {
    const response = await fetch(`/api/backend/drivers/verification/documents/${encodeURIComponent(documentId)}/url`, {
      cache: "no-store",
    });
    const body = await response.json();
    if (response.ok && body.url) window.open(body.url, "_blank", "noopener,noreferrer");
  }
  async function verifyDriver() {
    const response = await fetch(`/api/backend/drivers/verification/${safe}/verify`, { method: "PATCH" });
    if (response.ok) await mutate();
    else window.alert((await response.json()).message ?? "Driver verification failed.");
  }
  return (
    <main className="space-y-6">
      <PageHeader
        title="Driver document review"
        description={`Review short-lived document previews and verification state for driver ${driverId}.`}
        action={
          <Button onClick={verifyDriver}>
            <ShieldCheck />
            Verify driver
          </Button>
        }
      />
      {error ? (
        <p className="text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-muted-foreground">Loading documents…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>
                    {document.documentType} {document.side ? `· ${document.side}` : ""}
                  </span>
                  <StatusBadge value={document.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <dl className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-muted-foreground">Document ID</dt>
                  <dd className="truncate font-mono text-xs">{document.id}</dd>
                  <dt className="text-muted-foreground">Uploaded</dt>
                  <dd>{displayValue(document.createdAt)}</dd>
                  <dt className="text-muted-foreground">Expiry</dt>
                  <dd>{displayValue(document.expiryDate)}</dd>
                  <dt className="text-muted-foreground">Note</dt>
                  <dd>{displayValue(document.note)}</dd>
                  <dt className="text-muted-foreground">Rejection</dt>
                  <dd>{displayValue(document.rejectionReason)}</dd>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => view(document.id)}>
                    <ExternalLink />
                    Open document
                  </Button>
                  <Button onClick={() => mutateDocument(document.id, "approve")}>
                    <Check />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => mutateDocument(document.id, "reject")}>
                    <X />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
