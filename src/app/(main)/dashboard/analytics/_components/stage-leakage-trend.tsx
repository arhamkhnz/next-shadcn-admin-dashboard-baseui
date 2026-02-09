"use client";

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const leakageTrend = [
  { week: "W1", discovery: 2.1, qualification: 1.8, proposal: 1.3, total: 5.2 },
  { week: "W2", discovery: 2.3, qualification: 1.9, proposal: 1.4, total: 5.6 },
  { week: "W3", discovery: 2.6, qualification: 2.1, proposal: 1.6, total: 6.3 },
  { week: "W4", discovery: 2.4, qualification: 2.0, proposal: 1.7, total: 6.1 },
  { week: "W5", discovery: 2.9, qualification: 2.4, proposal: 1.9, total: 7.2 },
  { week: "W6", discovery: 3.2, qualification: 2.5, proposal: 2.1, total: 7.8 },
  { week: "W7", discovery: 3.0, qualification: 2.3, proposal: 2.0, total: 7.3 },
  { week: "W8", discovery: 2.7, qualification: 2.2, proposal: 1.8, total: 6.7 },
  { week: "W9", discovery: 2.9, qualification: 2.3, proposal: 1.9, total: 7.1 },
  { week: "W10", discovery: 3.1, qualification: 2.4, proposal: 2.0, total: 7.5 },
  { week: "W11", discovery: 2.8, qualification: 2.2, proposal: 1.8, total: 6.8 },
  { week: "W12", discovery: 2.6, qualification: 2.1, proposal: 1.7, total: 6.4 },
];

const leakageConfig = {
  discovery: {
    label: "Discovery",
    color: "var(--chart-1)",
  },
  qualification: {
    label: "Qualification",
    color: "var(--chart-2)",
  },
  proposal: {
    label: "Proposal",
    color: "var(--chart-3)",
  },
  total: {
    label: "Total leakage",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function StageLeakageTrend() {
  const latestLeakage = leakageTrend[leakageTrend.length - 1];

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Stage Leakage Trend</CardTitle>
          <CardDescription>Drop-offs by stage with total leakage over time.</CardDescription>
        </div>
        <CardAction>
          <Badge variant="secondary">12 weeks</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-3">
            <span>
              Total <span className="text-foreground tabular-nums">{latestLeakage.total}%</span>
            </span>
            <span>
              Proposal <span className="text-foreground tabular-nums">{latestLeakage.proposal}%</span>
            </span>
          </div>
          <span>Rolling average</span>
        </div>

        <ChartContainer config={leakageConfig} className="h-64 w-full">
          <AreaChart data={leakageTrend} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, 10]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillLeakageTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.25} />
                <stop offset="90%" stopColor="var(--color-total)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="total"
              type="natural"
              stroke="var(--color-total)"
              fill="url(#fillLeakageTotal)"
              strokeWidth={2}
            />
            <Line dataKey="proposal" type="natural" stroke="var(--color-proposal)" strokeWidth={2} dot={false} />
            <Line
              dataKey="qualification"
              type="natural"
              stroke="var(--color-qualification)"
              strokeWidth={2}
              dot={false}
            />
            <Line dataKey="discovery" type="natural" stroke="var(--color-discovery)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
