"use client";

import { useDeferredValue, useMemo, useState } from "react";

import Link from "next/link";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { displayValue, titleFromKey } from "@/lib/display";

import { StatusBadge } from "./status-badge";

const STATUS_KEYS = /^(status|state|freshness|verificationStatus)$/i;

export function ResourceTable({
  rows,
  columns,
  emptyMessage = "No records found.",
  linkBase,
  linkIdKey = "id",
}: {
  rows: Record<string, unknown>[];
  columns: string[];
  emptyMessage?: string;
  linkBase?: string;
  linkIdKey?: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = useMemo(
    () => (deferredQuery ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(deferredQuery)) : rows),
    [rows, deferredQuery],
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search loaded records…"
          className="pl-9"
          aria-label="Search records"
        />
      </div>
      <div className="rounded-lg border">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{titleFromKey(column)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, index) => (
                  <TableRow key={String(row.id ?? row.riderId ?? row.tripCode ?? index)}>
                    {columns.map((column) => (
                      <TableCell key={column} className="max-w-72 truncate">
                        {linkBase && column === columns[0] && (row[linkIdKey] || row.riderId) ? (
                          <Link
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={`${linkBase}/${String(row[linkIdKey] ?? row.riderId)}`}
                          >
                            {displayValue(row[column])}
                          </Link>
                        ) : STATUS_KEYS.test(column) ? (
                          <StatusBadge value={row[column]} />
                        ) : (
                          displayValue(row[column])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <p className="text-muted-foreground text-xs">
        Showing {filtered.length} of {rows.length} loaded records
      </p>
    </div>
  );
}
