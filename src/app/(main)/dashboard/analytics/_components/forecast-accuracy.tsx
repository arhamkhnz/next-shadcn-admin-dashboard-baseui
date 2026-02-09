"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const forecastTrend = [
  { month: "Aug", actual: 560, forecast: 540 },
  { month: "Sep", actual: 610, forecast: 600 },
  { month: "Oct", actual: 585, forecast: 620 },
  { month: "Nov", actual: 640, forecast: 630 },
  { month: "Dec", actual: 705, forecast: 690 },
  { month: "Jan", actual: 745, forecast: 720 },
];

const forecastConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
  forecast: {
    label: "Forecast",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ForecastAccuracy() {
  return (
    <Card className="shadow-xs lg:col-span-2">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Forecast</span>
            <span>Last 6 months</span>
          </div>
          <CardTitle>Forecast Integrity</CardTitle>
          <CardDescription>Accuracy and variance against committed revenue.</CardDescription>
        </div>
        <CardAction>
          <Badge variant="secondary">Accuracy 92%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border/60">
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Forecast error</div>
            <div className="font-semibold text-2xl text-primary tabular-nums">+1.8%</div>
            <div className="text-muted-foreground text-xs">Within tolerance</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Variance band</div>
            <div className="font-semibold text-2xl tabular-nums">±4.1%</div>
            <div className="text-muted-foreground text-xs">Last 6 months</div>
          </div>
          <div className="space-y-1 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Commit vs best</div>
            <div className="font-semibold text-2xl tabular-nums">87%</div>
            <div className="text-muted-foreground text-xs">Best-case alignment</div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <ChartContainer config={forecastConfig} className="h-52 w-full">
            <LineChart data={forecastTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide domain={[500, 800]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="var(--color-forecast)"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-chart-1" />
            Actual
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-chart-2" />
            Forecast
          </span>
          <span>Updated last close</span>
        </div>
      </CardContent>
    </Card>
  );
}
