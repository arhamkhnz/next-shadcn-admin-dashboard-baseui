"use client";

import { Area, AreaChart, Line, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pipelineTrend = [
  { week: "W1", pipeline: 1.12, target: 1.0 },
  { week: "W2", pipeline: 1.18, target: 1.05 },
  { week: "W3", pipeline: 1.22, target: 1.08 },
  { week: "W4", pipeline: 1.29, target: 1.12 },
  { week: "W5", pipeline: 1.26, target: 1.15 },
  { week: "W6", pipeline: 1.31, target: 1.18 },
  { week: "W7", pipeline: 1.34, target: 1.2 },
  { week: "W8", pipeline: 1.38, target: 1.22 },
];

const pipelineChartConfig = {
  pipeline: {
    label: "Pipeline",
    color: "var(--chart-1)",
  },
  target: {
    label: "Target",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function PipelineHealth() {
  return (
    <Card className="shadow-xs lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Pipeline Health</CardTitle>
          <CardDescription>Coverage, velocity, and risk alignment for the current cycle.</CardDescription>
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
      <CardContent className="grid gap-4 lg:grid-cols-[1.05fr_1.95fr]">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide">Coverage score</div>
          <div className="mt-2 font-semibold text-4xl tabular-nums">3.2x</div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Win rate</span>
              <span className="font-medium tabular-nums">22.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sales cycle</span>
              <span className="font-medium tabular-nums">31 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stalled deals</span>
              <span className="font-medium tabular-nums">22</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Revenue at risk</span>
              <span className="font-medium tabular-nums">$157,300</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <Badge variant="secondary">Aligned to row 1 summary</Badge>
            <Badge variant="outline">Target 3.5x</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Coverage trend</span>
            <span className="text-muted-foreground">Target band</span>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <ChartContainer config={pipelineChartConfig} className="h-48 w-full">
              <AreaChart data={pipelineTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis hide domain={[0.9, 1.5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-pipeline)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-pipeline)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="pipeline"
                  fill="url(#pipelineFill)"
                  stroke="var(--color-pipeline)"
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
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-sky-500" />
              Coverage
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-indigo-500" />
              Target
            </span>
            <span>Updated 2 hours ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
