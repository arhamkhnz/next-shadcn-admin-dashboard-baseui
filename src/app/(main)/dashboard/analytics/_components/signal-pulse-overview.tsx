"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, Brain, CalendarCheck, MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const riskAccounts = [
  {
    name: "Northwind Labs",
    owner: "MB",
    stage: "Proposal",
    risk: "High",
    daysIdle: 18,
    value: "$92,000",
    trend: "down" as const,
  },
  {
    name: "Hawthorne Retail",
    owner: "SK",
    stage: "Negotiation",
    risk: "Medium",
    daysIdle: 11,
    value: "$58,300",
    trend: "up" as const,
  },
  {
    name: "Bluewave Energy",
    owner: "JM",
    stage: "Discovery",
    risk: "High",
    daysIdle: 21,
    value: "$44,000",
    trend: "down" as const,
  },
  {
    name: "Silverline Health",
    owner: "AA",
    stage: "Proposal",
    risk: "Medium",
    daysIdle: 9,
    value: "$63,700",
    trend: "up" as const,
  },
];

const signals = [
  {
    title: "Usage intensity spiked",
    description: "Enterprise seats +12% in 48h",
    icon: Brain,
    tag: "Momentum",
    tone: "text-primary",
  },
  {
    title: "Sentiment drift",
    description: "Stakeholder sentiment dropped 18%",
    icon: MessageSquare,
    tag: "Attention",
    tone: "text-destructive",
  },
  {
    title: "AI scoring override",
    description: "Risk model flagged stalled champion",
    icon: Brain,
    tag: "Risk",
    tone: "text-primary",
  },
];

const actionQueue = [
  {
    title: "Reconfirm timeline with Northwind",
    detail: "No activity logged in 9 days · owner MB",
    icon: CalendarCheck,
    tone: "text-primary",
  },
  {
    title: "Recover proposal momentum",
    detail: "3 deals stalled beyond 14 days",
    icon: AlertTriangle,
    tone: "text-destructive",
  },
  {
    title: "Stakeholder check-in",
    detail: "Legal review pending on 2 accounts",
    icon: MessageSquare,
    tone: "text-primary",
  },
];

export function RiskTriage() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Risk Triage</span>
            <span>This week</span>
          </div>
          <CardTitle>Risk Workbench</CardTitle>
          <CardDescription>Prioritize accounts driving revenue exposure and slippage.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Open triage
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Accounts at risk</div>
            <div className="font-semibold text-2xl tabular-nums">9</div>
            <div className="text-muted-foreground text-xs">4 high · 5 medium</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Revenue exposure</div>
            <div className="font-semibold text-2xl tabular-nums">$157,300</div>
            <div className="text-muted-foreground text-xs">Matches summary</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Win-rate drift</div>
            <div className="font-semibold text-2xl text-destructive tabular-nums">-4.2%</div>
            <div className="text-muted-foreground text-xs">Last 30 days</div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table className="table-fixed [&_th]:whitespace-normal [&_td]:whitespace-normal">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Idle</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskAccounts.map((account) => (
                <TableRow key={account.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="font-medium text-xs">{account.owner}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-muted-foreground text-xs">Owner {account.owner}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md border bg-background px-2 py-1 text-xs">{account.stage}</span>
                  </TableCell>
                  <TableCell className="tabular-nums">{account.daysIdle} days</TableCell>
                  <TableCell className="font-medium tabular-nums">{account.value}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs">
                      {account.trend === "up" ? (
                        <ArrowUpRight className="size-3 text-primary" />
                      ) : (
                        <ArrowDownRight className="size-3 text-destructive" />
                      )}
                      <Badge variant="outline" className="px-2 py-0.5">
                        {account.risk}
                      </Badge>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="text-muted-foreground text-xs uppercase tracking-wide">Evidence signals</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal.title} className="flex items-start gap-2 rounded-md border bg-background p-2">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-md border bg-background ${signal.tone}`}>
                  <signal.icon className="size-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">{signal.title}</p>
                  <p className="text-muted-foreground text-[0.65rem]">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionQueuePanel() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Actions</span>
            <span>This week</span>
          </div>
          <CardTitle>Action Queue</CardTitle>
          <CardDescription>Focused follow-ups to unblock stalled revenue.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Assign owners
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Due today</div>
            <div className="font-semibold text-2xl tabular-nums">2</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Overdue</div>
            <div className="font-semibold text-2xl text-destructive tabular-nums">1</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Queued</div>
            <div className="font-semibold text-2xl tabular-nums">3</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="divide-y divide-border/60">
            {actionQueue.map((action) => (
              <div key={action.title} className="flex items-start gap-3 p-3">
                <div className={`flex size-9 items-center justify-center rounded-lg border bg-background ${action.tone}`}>
                  <action.icon className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-muted-foreground text-xs">{action.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SignalStream() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Signals</span>
            <span>Live</span>
          </div>
          <CardTitle>Signal Stream</CardTitle>
          <CardDescription>High-signal events across active opportunities.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Review feed
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Signals monitored</div>
            <div className="font-semibold text-2xl tabular-nums">14</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Active alerts</div>
            <div className="font-semibold text-2xl tabular-nums">5</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">New this week</div>
            <div className="font-semibold text-2xl text-primary tabular-nums">+2</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="divide-y divide-border/60">
            {signals.map((signal) => (
              <div key={signal.title} className="flex items-start gap-3 p-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background ${signal.tone}`}>
                  <signal.icon className="size-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{signal.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {signal.tag}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
