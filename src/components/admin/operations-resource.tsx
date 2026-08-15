"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { rowsFromPayload } from "@/lib/display";

import { ResourceTable } from "./resource-table";
import type { LinkedResourceColumn, ResourceAction } from "./resource-types";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load this resource.");
  return body;
};

export function OperationsResource({
  endpoint,
  columns,
  payloadKey,
  refreshInterval = 0,
  emptyMessage,
  linkBase,
  linkIdKey,
  actions,
  actionIdKey,
  labelKeys,
  exportFilename,
  linkedColumns,
}: {
  endpoint: string;
  columns: string[];
  payloadKey?: string;
  refreshInterval?: number;
  emptyMessage?: string;
  linkBase?: string;
  linkIdKey?: string;
  actions?: ResourceAction[];
  actionIdKey?: string;
  labelKeys?: string[];
  exportFilename?: string;
  linkedColumns?: Record<string, LinkedResourceColumn>;
}) {
  const { data, error, isLoading, mutate, isValidating } = useSWR(`/api/backend/${endpoint}`, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Could not load data</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{error.message}</span>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            <RefreshCw />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => mutate()} disabled={isValidating}>
            <RefreshCw className={isValidating ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
        <ResourceTable
          rows={rowsFromPayload(data, payloadKey)}
          columns={columns}
          emptyMessage={emptyMessage}
          linkBase={linkBase}
          linkIdKey={linkIdKey}
          actions={actions}
          actionIdKey={actionIdKey}
          labelKeys={labelKeys}
          onActionCompleted={() => mutate()}
          exportFilename={exportFilename ?? endpoint.split("?")[0].replace(/\//g, "-")}
          linkedColumns={linkedColumns}
        />
      </CardContent>
    </Card>
  );
}
