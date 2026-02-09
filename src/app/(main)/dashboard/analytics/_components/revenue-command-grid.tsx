"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Target,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium";

const momentumDeltas = [
  {
    label: "Coverage",
    value: "3.2x",
    delta: "+0.2x",
    tone: "text-primary",
    context: "Target 3.5x",
  },
  {
    label: "Weighted win rate",
    value: "22.1%",
    delta: "+1.3 pts",
    tone: "text-primary",
    context: "Enterprise-led lift",
  },
  {
    label: "Revenue at risk",
    value: "$157,300",
    delta: "-12.1k",
    tone: "text-primary",
    context: "Improved from prior review",
  },
  {
    label: "Stalled deals",
    value: "22",
    delta: "+2",
    tone: "text-amber-600",
    context: "Needs reduction this week",
  },
] as const;

const coverageTrend = [
  { week: "W1", coverage: 2.7, target: 3.2, leakage: 6.8 },
  { week: "W2", coverage: 2.8, target: 3.2, leakage: 6.9 },
  { week: "W3", coverage: 2.9, target: 3.25, leakage: 7.1 },
  { week: "W4", coverage: 3.0, target: 3.3, leakage: 6.7 },
  { week: "W5", coverage: 3.1, target: 3.35, leakage: 6.9 },
  { week: "W6", coverage: 3.2, target: 3.4, leakage: 6.5 },
  { week: "W7", coverage: 3.15, target: 3.4, leakage: 6.6 },
  { week: "W8", coverage: 3.22, target: 3.45, leakage: 6.4 },
];

const coverageConfig = {
  coverage: {
    label: "Coverage",
    color: "var(--chart-1)",
  },
  target: {
    label: "Target",
    color: "var(--chart-3)",
  },
  leakage: {
    label: "Leakage",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const weeklyReadout = [
  {
    label: "Coverage above 3.0x",
    detail: "5 of last 6 weeks",
    status: "good",
  },
  {
    label: "Proposal stage leakage",
    detail: "1.8% (within threshold)",
    status: "good",
  },
  {
    label: "Idle deals above 14 days",
    detail: "22 accounts (needs reduction)",
    status: "warn",
  },
  {
    label: "Forecast error",
    detail: "+1.8% (inside tolerance)",
    status: "good",
  },
] as const;

const interventionLedger: Array<{
  account: string;
  stage: string;
  owner: string;
  idle: number;
  blocker: string;
  nextAction: string;
  value: string;
  severity: Severity;
}> = [
  {
    account: "Northwind Labs",
    stage: "Proposal",
    owner: "M. Benson",
    idle: 18,
    blocker: "Legal redlines pending",
    nextAction: "Exec sponsor call",
    value: "$92,000",
    severity: "critical",
  },
  {
    account: "Bluewave Energy",
    stage: "Discovery",
    owner: "J. Miller",
    idle: 21,
    blocker: "Champion inactive",
    nextAction: "Re-qualify buying committee",
    value: "$44,000",
    severity: "high",
  },
  {
    account: "Hawthorne Retail",
    stage: "Negotiation",
    owner: "S. Kim",
    idle: 11,
    blocker: "Procurement queue",
    nextAction: "Procurement unblock workshop",
    value: "$58,300",
    severity: "medium",
  },
  {
    account: "Silverline Health",
    stage: "Proposal",
    owner: "A. Ahmed",
    idle: 9,
    blocker: "Security questionnaire",
    nextAction: "Security response package",
    value: "$63,700",
    severity: "medium",
  },
];

const interventionQueue: Array<{
  title: string;
  owner: string;
  due: string;
  impact: string;
  tone: "critical" | "active";
}> = [
  {
    title: "Recover Northwind timeline",
    owner: "MB · Enterprise",
    due: "Due in 6h",
    impact: "$92k",
    tone: "critical",
  },
  {
    title: "Unblock Bluewave champion",
    owner: "JM · Mid-market",
    due: "Due tomorrow",
    impact: "$44k",
    tone: "critical",
  },
  {
    title: "Refresh pricing packet",
    owner: "SK · Commercial",
    due: "Due in 2 days",
    impact: "$101k",
    tone: "active",
  },
];

const signalDigest: Array<{
  title: string;
  summary: string;
  confidence: number;
  type: "positive" | "warning";
}> = [
  {
    title: "Usage acceleration",
    summary: "Enterprise seats +12% in 48h",
    confidence: 86,
    type: "positive",
  },
  {
    title: "Stakeholder sentiment drift",
    summary: "Decision-maker sentiment -18%",
    confidence: 73,
    type: "warning",
  },
  {
    title: "Procurement delay pattern",
    summary: "Median legal cycle now 9.4d",
    confidence: 79,
    type: "warning",
  },
];

const stageTransitions = [
  {
    flow: "New -> Qualified",
    conversion: 62,
    leakage: 2.6,
    delta: "+0.4 pts",
    trend: "up" as const,
  },
  {
    flow: "Qualified -> Demo",
    conversion: 35,
    leakage: 2.0,
    delta: "-0.2 pts",
    trend: "down" as const,
  },
  {
    flow: "Demo -> Proposal",
    conversion: 20,
    leakage: 1.8,
    delta: "+0.3 pts",
    trend: "up" as const,
  },
  {
    flow: "Proposal -> Closed",
    conversion: 9,
    leakage: 1.4,
    delta: "-0.1 pts",
    trend: "down" as const,
  },
];

const forecastTrend = [
  { month: "Aug", actual: 560, commit: 540 },
  { month: "Sep", actual: 610, commit: 600 },
  { month: "Oct", actual: 585, commit: 620 },
  { month: "Nov", actual: 640, commit: 630 },
  { month: "Dec", actual: 705, commit: 690 },
  { month: "Jan", actual: 745, commit: 720 },
];

const forecastConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
  commit: {
    label: "Commit",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const severityTone: Record<Severity, string> = {
  critical: "border-destructive/30 text-destructive",
  high: "border-amber-500/30 text-amber-600",
  medium: "border-primary/25 text-primary",
};

export function RevenueCommandGrid() {
  return (
    <div className="space-y-6">
      <PipelineMomentumBoard />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <DealInterventionBoard />
        <div className="grid content-start gap-6">
          <InterventionQueueCard />
          <SignalDigestCard />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <StageFlowBoard />
        <ForecastIntegrityCard />
      </div>
    </div>
  );
}

function PipelineMomentumBoard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Momentum board</span>
            <span>Coverage + leakage</span>
          </div>
          <CardTitle>Pipeline Momentum</CardTitle>
          <CardDescription>Coverage versus target with leakage trend, plus a short weekly readout.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            View weekly review
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-2 xl:grid-cols-4">
          {momentumDeltas.map((metric) => (
            <div key={metric.label} className="rounded-md border bg-background p-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{metric.label}</p>
              <p className="mt-1 font-semibold text-xl tabular-nums">{metric.value}</p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className={cn("inline-flex items-center gap-1 font-medium", metric.tone)}>
                  {metric.delta.startsWith("+") ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {metric.delta}
                </span>
                <span className="text-muted-foreground">{metric.context}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,1fr)]">
          <div className="rounded-lg border bg-card p-3">
            <ChartContainer config={coverageConfig} className="h-64 w-full">
              <AreaChart data={coverageTrend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis hide domain={[2.2, 3.8]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillCoverageMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-coverage)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-coverage)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="coverage"
                  fill="url(#fillCoverageMomentum)"
                  stroke="var(--color-coverage)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-target)"
                  strokeDasharray="6 6"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
              <span>Coverage now 3.2x</span>
              <span>Gap to target: 0.3x</span>
              <span>Leakage stable at 6.4%</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Weekly readout</p>
              <Badge variant="secondary">4 checks</Badge>
            </div>
            {weeklyReadout.map((item, index) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border bg-background",
                      item.status === "good" ? "text-primary" : "text-destructive",
                    )}
                  >
                    {item.status === "good" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <AlertTriangle className="size-3.5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.detail}</p>
                  </div>
                </div>
                {index < weeklyReadout.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DealInterventionBoard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Intervention ledger</span>
            <span>Actionable accounts</span>
          </div>
          <CardTitle>Revenue Risk Ledger</CardTitle>
          <CardDescription>Accounts under pressure with blocker, next action, and expected impact.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Open full register
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <MetricStrip label="Critical accounts" value="2" detail="Need exec support" />
          <MetricStrip label="Median idle" value="14 days" detail="Across top risk deals" />
          <MetricStrip label="Recovery value" value="$258k" detail="In active queue" />
        </div>

        <Table className="table-fixed [&_td]:whitespace-normal [&_th]:whitespace-normal">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Blocker</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Idle</TableHead>
              <TableHead>Next action</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventionLedger.map((row) => (
              <TableRow key={row.account}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{row.account}</p>
                    <p className="text-muted-foreground text-xs">{row.stage}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{row.blocker}</TableCell>
                <TableCell className="text-xs">{row.owner}</TableCell>
                <TableCell className="text-xs tabular-nums">{row.idle}d</TableCell>
                <TableCell className="text-xs">{row.nextAction}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-right">
                    <p className="font-medium tabular-nums">{row.value}</p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", severityTone[row.severity])}>
                      {row.severity}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InterventionQueueCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Queue</span>
            <span>This week</span>
          </div>
          <CardTitle>Intervention Queue</CardTitle>
          <CardDescription>Prioritized tasks sorted by near-term revenue impact.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {interventionQueue.map((task, index) => (
          <div key={task.title} className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-sm">{task.title}</p>
                <p className="text-muted-foreground text-xs">{task.owner}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium text-[11px]",
                  task.tone === "critical"
                    ? "border-destructive/30 text-destructive"
                    : "border-primary/25 text-primary",
                )}
              >
                {task.tone === "critical" ? <AlertTriangle className="size-3" /> : <Target className="size-3" />}
                {task.impact}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3" />
                {task.due}
              </span>
              <span className="inline-flex items-center gap-1">
                Open
                <ArrowRight className="size-3" />
              </span>
            </div>
            {index < interventionQueue.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SignalDigestCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Signals</span>
            <span>Model confidence</span>
          </div>
          <CardTitle>Signal Digest</CardTitle>
          <CardDescription>High-signal events with confidence scoring for triage priority.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {signalDigest.map((signal, index) => (
          <div key={signal.title} className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-background",
                    signal.type === "positive" ? "text-primary" : "text-destructive",
                  )}
                >
                  {signal.type === "positive" ? (
                    <BrainCircuit className="size-3.5" />
                  ) : (
                    <ShieldAlert className="size-3.5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{signal.title}</p>
                  <p className="text-muted-foreground text-xs">{signal.summary}</p>
                </div>
              </div>
              <p className="font-medium text-xs tabular-nums">{signal.confidence}%</p>
            </div>
            <Progress value={signal.confidence} className="h-1.5 bg-muted" />
            {index < signalDigest.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StageFlowBoard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Conversion flow</span>
            <span>Where deals leak</span>
          </div>
          <CardTitle>Stage Flow Readout</CardTitle>
          <CardDescription>
            Conversion and leakage per handoff so pipeline friction is visible at a glance.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stageTransitions.map((row, index) => (
          <div key={row.flow} className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium">{row.flow}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  row.trend === "up" ? "text-primary" : "text-destructive",
                )}
              >
                {row.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {row.delta}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Conversion {row.conversion}%</span>
              <span>Leakage {row.leakage}%</span>
            </div>
            <Progress value={row.conversion} className="h-1.5 bg-muted" />
            {index < stageTransitions.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ForecastIntegrityCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Forecast integrity</span>
            <span>Last 6 months</span>
          </div>
          <CardTitle>Commit vs Actual</CardTitle>
          <CardDescription>
            Forecast quality is shown with variance and alignment, not a standalone score.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <MetricStrip label="Accuracy" value="92%" detail="Commit quality" />
          <MetricStrip label="Forecast error" value="+1.8%" detail="Within tolerance" />
          <MetricStrip label="Variance band" value="±4.1%" detail="6-month range" />
        </div>

        <div className="rounded-lg border bg-card p-3">
          <ChartContainer config={forecastConfig} className="h-48 w-full">
            <LineChart data={forecastTrend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide domain={[500, 800]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="commit"
                stroke="var(--color-commit)"
                strokeDasharray="6 6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricStrip(props: { label: string; value: string; detail: string }) {
  return (
    <div className="space-y-1 sm:px-3 sm:last:pr-0 sm:first:pl-0">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{props.label}</p>
      <p className="font-semibold text-2xl tabular-nums">{props.value}</p>
      <p className="text-muted-foreground text-xs">{props.detail}</p>
    </div>
  );
}
