"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatResourceValue, titleFromKey } from "@/lib/display";

export function ExportRecordsButton({
  rows,
  columns,
  filename = "liftngo-records",
}: {
  rows: Record<string, unknown>[];
  columns: string[];
  filename?: string;
}) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={() => downloadCsv(rows, columns, filename)}>
      <Download />
      Export CSV
    </Button>
  );
}

export function recordsToCsv(rows: Record<string, unknown>[], columns: string[]) {
  const header = columns.map((column) => csvCell(titleFromKey(column.replace(/Paise$/i, "")))).join(",");
  const body = rows
    .map((row) => columns.map((column) => csvCell(formatResourceValue(column, row[column]))).join(","))
    .join("\r\n");
  return body ? `${header}\r\n${body}` : header;
}

function downloadCsv(rows: Record<string, unknown>[], columns: string[], filename: string) {
  const csv = recordsToCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFilename(filename)}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "liftngo-records"
  );
}
