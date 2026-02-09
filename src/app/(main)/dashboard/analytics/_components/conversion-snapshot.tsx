"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, Line, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const velocityChartData = [
  { week: "W1", velocity: 28, target: 24 },
  { week: "W2", velocity: 30, target: 25 },
  { week: "W3", velocity: 26, target: 26 },
  { week: "W4", velocity: 34, target: 28 },
  { week: "W5", velocity: 37, target: 29 },
  { week: "W6", velocity: 33, target: 30 },
  { week: "W7", velocity: 39, target: 31 },
  { week: "W8", velocity: 42, target: 32 },
];

const velocityChartConfig = {
  velocity: {
    label: "Velocity",
    color: "var(--chart-1)",
  },
  target: {
    label: "Target",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const conversionStages = [
  {
    stage: "New",
    count: 420,
    rate: 100,
    share: 38,
    delta: "+12%",
    trend: "up" as const,
  },
  {
    stage: "Qualified",
    count: 262,
    rate: 62,
    share: 24,
    delta: "-5%",
    trend: "down" as const,
  },
  {
    stage: "Demo",
    count: 146,
    rate: 35,
    share: 18,
    delta: "+3%",
    trend: "up" as const,
  },
  {
    stage: "Proposal",
    count: 84,
    rate: 20,
    share: 12,
    delta: "+1%",
    trend: "up" as const,
  },
  {
    stage: "Closed",
    count: 38,
    rate: 9,
    share: 8,
    delta: "-2%",
    trend: "down" as const,
  },
];

export function ConversionSnapshot() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Pipeline</span>
            <span>Last 8 weeks</span>
          </div>
          <CardTitle>Pipeline Snapshot</CardTitle>
          <CardDescription>Momentum and conversion health at a glance.</CardDescription>
        </div>
        <CardAction>
          <Select defaultValue="last-8-weeks">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-4-weeks">Last 4 weeks</SelectItem>
              <SelectItem value="last-8-weeks">Last 8 weeks</SelectItem>
              <SelectItem value="quarter">Quarter to date</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Momentum score</div>
            <div className="mt-2 font-semibold text-3xl tabular-nums">84</div>
            <div className="mt-1 text-muted-foreground text-xs">+4.2% vs last period</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Overall conversion</div>
            <div className="mt-2 font-semibold text-3xl tabular-nums">36.4%</div>
            <div className="mt-1 text-muted-foreground text-xs">Stage hygiene improved</div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Velocity trend</span>
            <span className="text-muted-foreground">Target band</span>
          </div>
          <div className="mt-3">
            <ChartContainer config={velocityChartConfig} className="h-36 w-full">
              <AreaChart data={velocityChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis hide domain={[20, 48]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-velocity)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-velocity)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="velocity"
                  fill="url(#velocityFill)"
                  stroke="var(--color-velocity)"
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
          </div>
          <div className="mt-3 flex items-center gap-3 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-chart-1" />
              Velocity
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-chart-3" />
              Target
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Stage conversion</span>
            <span className="text-muted-foreground">Share of pipeline</span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {conversionStages.map((stage, index) => (
              <div
                key={stage.stage}
                className="h-full"
                style={{
                  width: `${stage.share}%`,
                  backgroundColor: `var(--chart-${index + 1})`,
                }}
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {conversionStages.map((stage) => (
              <div key={stage.stage} className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count} deals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{stage.rate}%</span>
                    <span className={stage.trend === "up" ? "text-primary" : "text-destructive"}>
                      {stage.trend === "up" ? <ArrowUpRight className="inline size-3" /> : null}
                      {stage.trend === "down" ? <ArrowDownRight className="inline size-3" /> : null}
                      {stage.delta}
                    </span>
                  </div>
                </div>
                <Progress value={stage.rate} className="mt-2 h-2 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
