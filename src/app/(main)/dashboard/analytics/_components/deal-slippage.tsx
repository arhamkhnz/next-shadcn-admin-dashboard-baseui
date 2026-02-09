"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const slippage = [
  {
    account: "Northwind Labs",
    stage: "Proposal",
    close: "Feb 14",
    idle: 18,
    value: "$92,000",
    trend: "down" as const,
    risk: "High",
  },
  {
    account: "Hawthorne Retail",
    stage: "Negotiation",
    close: "Feb 03",
    idle: 11,
    value: "$58,300",
    trend: "up" as const,
    risk: "Medium",
  },
  {
    account: "Bluewave Energy",
    stage: "Discovery",
    close: "Feb 18",
    idle: 21,
    value: "$44,000",
    trend: "down" as const,
    risk: "High",
  },
  {
    account: "Silverline Health",
    stage: "Proposal",
    close: "Feb 09",
    idle: 9,
    value: "$63,700",
    trend: "up" as const,
    risk: "Medium",
  },
];

export function DealSlippage() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Slippage</span>
            <span>Next 30 days</span>
          </div>
          <CardTitle>Slippage Watchlist</CardTitle>
          <CardDescription>Accounts drifting beyond the expected close window.</CardDescription>
        </div>
        <CardAction>
          <Badge variant="secondary">22 stalled</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Avg idle</div>
            <div className="font-semibold text-2xl tabular-nums">15 days</div>
            <div className="text-muted-foreground text-xs">Across stalled deals</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">High risk</div>
            <div className="font-semibold text-2xl tabular-nums">2</div>
            <div className="text-muted-foreground text-xs">Needs intervention</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">At-risk value</div>
            <div className="font-semibold text-2xl tabular-nums">$157,300</div>
            <div className="text-muted-foreground text-xs">Matches risk summary</div>
          </div>
        </div>
        <Table className="table-fixed [&_th]:whitespace-normal [&_td]:whitespace-normal">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Close</TableHead>
              <TableHead>Idle</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slippage.map((deal) => (
              <TableRow key={deal.account}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{deal.account}</p>
                    <Badge variant="outline" className="w-fit px-2 py-0.5 text-xs">
                      {deal.risk}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-md border bg-background px-2 py-1 text-xs">{deal.stage}</span>
                </TableCell>
                <TableCell className="tabular-nums">{deal.close}</TableCell>
                <TableCell className="tabular-nums">{deal.idle} days</TableCell>
                <TableCell className="font-medium tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    {deal.trend === "up" ? (
                      <ArrowUpRight className="size-3 text-primary" />
                    ) : (
                      <ArrowDownRight className="size-3 text-destructive" />
                    )}
                    {deal.value}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-muted-foreground text-xs">Revenue at risk matches row 1 summary: $157,300.</div>
      </CardContent>
    </Card>
  );
}
