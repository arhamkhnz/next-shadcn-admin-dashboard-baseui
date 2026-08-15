"use client";

import Link from "next/link";

import { AlertCircle, ArrowLeft } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { displayValue, titleFromKey } from "@/lib/display";

import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body;
  });
const STATUS_KEYS = /^(status|state|verificationStatus)$/i;

export function RecordDetail({
  title,
  description,
  endpoint,
  backHref,
}: {
  title: string;
  description: string;
  endpoint: string;
  backHref: string;
}) {
  const { data, error, isLoading } = useSWR<Record<string, unknown>>(`/api/backend/${endpoint}`, fetcher);
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button variant="outline" render={<Link href={backHref} />}>
            <ArrowLeft />
            Back
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Record unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : data ? (
        <Card>
          <CardContent className="pt-6">
            <dl className="grid gap-x-8 gap-y-4 md:grid-cols-[180px_1fr]">
              {Object.entries(data).map(([key, value]) => (
                <div className="grid gap-1 md:col-span-2 md:grid-cols-subgrid" key={key}>
                  <dt className="font-medium text-muted-foreground text-sm">{titleFromKey(key)}</dt>
                  <dd className="min-w-0 break-words text-sm">
                    {STATUS_KEYS.test(key) ? (
                      <StatusBadge value={value} />
                    ) : typeof value === "object" && value !== null ? (
                      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-xs">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      displayValue(value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
