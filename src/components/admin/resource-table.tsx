"use client";

import { type ReactNode, useDeferredValue, useMemo, useState } from "react";

import Link from "next/link";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactId, formatResourceValue, recordLabel, titleFromKey } from "@/lib/display";

import { ExportRecordsButton } from "./export-records-button";
import { LayoutToggle } from "./layout-toggle";
import { usePersistentLayout } from "./persistent-layout";
import { ResourceActions } from "./resource-actions";
import type { LinkedResourceColumn, ResourceAction } from "./resource-types";
import { StatusBadge } from "./status-badge";

const STATUS_KEYS = /^(status|state|freshness|verificationStatus)$/i;

export function ResourceTable({
  rows,
  columns,
  emptyMessage = "No records found.",
  linkBase,
  linkIdKey = "id",
  actions = [],
  actionIdKey = "id",
  labelKeys = [],
  onActionCompleted,
  exportFilename = "liftngo-records",
  linkedColumns,
  renderRowActions,
}: {
  rows: Record<string, unknown>[];
  columns: string[];
  emptyMessage?: string;
  linkBase?: string;
  linkIdKey?: string;
  actions?: ResourceAction[];
  actionIdKey?: string;
  labelKeys?: string[];
  onActionCompleted?: () => void | Promise<void>;
  exportFilename?: string;
  linkedColumns?: Record<string, LinkedResourceColumn>;
  renderRowActions?: (row: Record<string, unknown>) => ReactNode;
}) {
  const [layout, setLayout] = usePersistentLayout();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = useMemo(
    () =>
      deferredQuery
        ? rows.filter((row) =>
            [recordLabel(row, labelKeys), ...columns.map((column) => formatResourceValue(column, row[column]))]
              .join(" ")
              .toLowerCase()
              .includes(deferredQuery),
          )
        : rows,
    [rows, deferredQuery, columns, labelKeys],
  );
  const hasActions = actions.length > 0 || Boolean(linkBase) || Boolean(renderRowActions);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search these records…"
            className="pl-9"
            aria-label="Search records"
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <ExportRecordsButton rows={filtered} columns={columns} filename={exportFilename} />
          <LayoutToggle value={layout} onChange={setLayout} />
        </div>
      </div>
      {layout === "list" ? (
        <div className="hidden overflow-hidden rounded-lg border md:block" data-testid="resource-list">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={column} className={desktopColumnClass(index)}>
                    {titleFromKey(column.replace(/Paise$/i, ""))}
                  </TableHead>
                ))}
                {hasActions ? (
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, index) => (
                  <TableRow key={String(row.id ?? row.riderId ?? row.tripCode ?? index)}>
                    {columns.map((column, columnIndex) => (
                      <TableCell key={column} className={desktopColumnClass(columnIndex)}>
                        {desktopCell(row, column, columns[0], linkBase, linkIdKey, linkedColumns)}
                      </TableCell>
                    ))}
                    {hasActions ? (
                      <TableCell className="w-12 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {renderRowActions?.(row)}
                          <ResourceActions
                            row={row}
                            actions={actions}
                            idKey={actionIdKey}
                            labelKeys={labelKeys}
                            onCompleted={onActionCompleted}
                            detailsHref={recordHref(row, linkBase, linkIdKey)}
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : null}
      {layout === "list" ? (
        <div className="space-y-2 md:hidden" data-testid="mobile-resource-list">
          {filtered.length === 0 ? (
            <div className="rounded-lg border px-4 py-10 text-center text-muted-foreground text-sm">{emptyMessage}</div>
          ) : (
            filtered.map((row, index) => {
              const label = recordLabel(row, labelKeys);
              const visibleColumns = columns.filter((column) => !/(^id$|Id$)/.test(column)).slice(0, 4);
              return (
                <article
                  className="rounded-lg border bg-card p-4"
                  key={String(row.id ?? row.riderId ?? row.tripCode ?? index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {recordHref(row, linkBase, linkIdKey) ? (
                        <Link className="block truncate font-medium" href={recordHref(row, linkBase, linkIdKey) ?? "#"}>
                          {label}
                        </Link>
                      ) : (
                        <h3 className="truncate font-medium">{label}</h3>
                      )}
                      <p className="mt-0.5 font-mono text-muted-foreground text-xs">
                        {compactId(row[actionIdKey] ?? row.id ?? row.riderId)}
                      </p>
                    </div>
                    {hasActions ? (
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        {renderRowActions?.(row)}
                        <ResourceActions
                          row={row}
                          actions={actions}
                          idKey={actionIdKey}
                          labelKeys={labelKeys}
                          onCompleted={onActionCompleted}
                          detailsHref={recordHref(row, linkBase, linkIdKey)}
                        />
                      </div>
                    ) : null}
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm">
                    {visibleColumns.map((column) => (
                      <div className="grid grid-cols-[minmax(6rem,0.45fr)_1fr] gap-3" key={column}>
                        <dt className="text-muted-foreground">{titleFromKey(column.replace(/Paise$/i, ""))}</dt>
                        <dd className="min-w-0 truncate text-right">
                          <ResourceColumnValue row={row} column={column} linkedColumns={linkedColumns} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" data-testid="resource-grid">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-lg border px-4 py-12 text-center text-muted-foreground text-sm">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((row, index) => (
              <ResourceGridCard
                key={String(row.id ?? row.riderId ?? row.tripCode ?? index)}
                row={row}
                columns={columns}
                linkBase={linkBase}
                linkIdKey={linkIdKey}
                actions={actions}
                actionIdKey={actionIdKey}
                labelKeys={labelKeys}
                onActionCompleted={onActionCompleted}
                linkedColumns={linkedColumns}
                renderRowActions={renderRowActions}
              />
            ))
          )}
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        Showing {filtered.length} of {rows.length} loaded records
      </p>
    </div>
  );
}

function ResourceGridCard({
  row,
  columns,
  linkBase,
  linkIdKey,
  actions,
  actionIdKey,
  labelKeys,
  onActionCompleted,
  linkedColumns,
  renderRowActions,
}: {
  row: Record<string, unknown>;
  columns: string[];
  linkBase?: string;
  linkIdKey: string;
  actions: ResourceAction[];
  actionIdKey: string;
  labelKeys: string[];
  onActionCompleted?: () => void | Promise<void>;
  linkedColumns?: Record<string, LinkedResourceColumn>;
  renderRowActions?: (row: Record<string, unknown>) => ReactNode;
}) {
  const label = recordLabel(row, labelKeys);
  const detailsHref = recordHref(row, linkBase, linkIdKey);
  const visibleColumns = columns.filter((column) => !/(^id$|Id$)/.test(column)).slice(0, 5);

  return (
    <article className="group rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-foreground/20 hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {detailsHref ? (
            <Link className="block truncate font-medium underline-offset-4 hover:underline" href={detailsHref}>
              {label}
            </Link>
          ) : (
            <h3 className="truncate font-medium">{label}</h3>
          )}
          <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
            {compactId(row[actionIdKey] ?? row.id ?? row.riderId)}
          </p>
        </div>
        {actions.length > 0 || detailsHref || renderRowActions ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {renderRowActions?.(row)}
            <ResourceActions
              row={row}
              actions={actions}
              idKey={actionIdKey}
              labelKeys={labelKeys}
              onCompleted={onActionCompleted}
              detailsHref={detailsHref}
            />
          </div>
        ) : null}
      </div>
      <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
        {visibleColumns.map((column) => (
          <div className="flex items-start justify-between gap-4" key={column}>
            <dt className="shrink-0 text-muted-foreground">{titleFromKey(column.replace(/Paise$/i, ""))}</dt>
            <dd className="min-w-0 truncate text-right" title={formatResourceValue(column, row[column])}>
              <ResourceColumnValue row={row} column={column} linkedColumns={linkedColumns} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function desktopColumnClass(index: number): string {
  if (index >= 6) return "hidden truncate 2xl:table-cell";
  if (index >= 4) return "hidden truncate xl:table-cell";
  return "truncate";
}

function ResourceColumnValue({
  row,
  column,
  linkedColumns,
}: {
  row: Record<string, unknown>;
  column: string;
  linkedColumns?: Record<string, LinkedResourceColumn>;
}) {
  const linkedColumn = linkedColumns?.[column];
  if (STATUS_KEYS.test(column)) return <StatusBadge value={row[column]} />;
  if (linkedColumn) return <LinkedColumnValue row={row} column={column} link={linkedColumn} />;
  return formatResourceValue(column, row[column]);
}

function desktopCell(
  row: Record<string, unknown>,
  column: string,
  firstColumn: string,
  linkBase?: string,
  linkIdKey = "id",
  linkedColumns?: Record<string, LinkedResourceColumn>,
) {
  const value = row[column];
  const linkedColumn = linkedColumns?.[column];
  if (linkedColumn) return <LinkedColumnValue row={row} column={column} link={linkedColumn} />;
  if (linkBase && column === firstColumn && (row[linkIdKey] || row.riderId)) {
    return (
      <Link
        className="block truncate font-medium text-primary underline-offset-4 hover:underline"
        href={`${linkBase}/${String(row[linkIdKey] ?? row.riderId)}`}
      >
        {formatResourceValue(column, value)}
      </Link>
    );
  }
  if (STATUS_KEYS.test(column)) return <StatusBadge value={value} />;
  if (/(^id$|Id$)/.test(column)) {
    return (
      <span className="block truncate font-mono text-xs" title={String(value ?? "")}>
        {compactId(value)}
      </span>
    );
  }
  return (
    <span className="block truncate" title={formatResourceValue(column, value)}>
      {formatResourceValue(column, value)}
    </span>
  );
}

function LinkedColumnValue({
  row,
  column,
  link,
}: {
  row: Record<string, unknown>;
  column: string;
  link: LinkedResourceColumn;
}) {
  const value = row[column];
  const id = row[link.idKey ?? column];
  if (!id) {
    return (
      <span className="block truncate" title={formatResourceValue(column, value)}>
        {formatResourceValue(column, value)}
      </span>
    );
  }
  return (
    <Link
      className="block truncate font-mono text-primary text-xs underline-offset-4 hover:underline"
      href={`${link.hrefBase}/${encodeURIComponent(String(id))}`}
      title={String(value ?? id)}
    >
      {compactId(value ?? id)}
    </Link>
  );
}

function recordHref(row: Record<string, unknown>, linkBase?: string, linkIdKey = "id"): string | undefined {
  if (!linkBase) return undefined;
  const id = row[linkIdKey] ?? row.riderId;
  return id ? `${linkBase}/${String(id)}` : undefined;
}
