import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

const segments: Array<{
  id: string;
  label: string;
  coverage: number;
  pipeline: string;
  velocity: string;
  trend: Trend;
  spark: number[];
}> = [
  {
    id: "enterprise",
    label: "Enterprise",
    coverage: 82,
    pipeline: "$1.2M",
    velocity: "21d",
    trend: "up",
    spark: [6, 8, 9, 7, 10, 9],
  },
  {
    id: "mid-market",
    label: "Mid-market",
    coverage: 74,
    pipeline: "$860k",
    velocity: "18d",
    trend: "up",
    spark: [5, 6, 7, 6, 8, 7],
  },
  {
    id: "smb",
    label: "SMB",
    coverage: 61,
    pipeline: "$410k",
    velocity: "14d",
    trend: "flat",
    spark: [4, 5, 4, 6, 5, 5],
  },
  {
    id: "public",
    label: "Public sector",
    coverage: 48,
    pipeline: "$290k",
    velocity: "29d",
    trend: "down",
    spark: [5, 4, 3, 4, 3, 2],
  },
];

const trendTone: Record<Trend, string> = {
  up: "border-emerald-500/30 text-emerald-600",
  down: "border-rose-500/30 text-rose-600",
  flat: "border-muted text-muted-foreground",
};

const sparkTone = (value: number) => {
  if (value >= 9) return "var(--chart-4)";
  if (value >= 7) return "var(--chart-3)";
  if (value >= 5) return "var(--chart-2)";
  return "var(--chart-1)";
};

export function SegmentPerformance() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Segment Coverage</CardTitle>
          <CardDescription>Pipeline coverage and velocity by segment.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            View segments
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Coverage target</span>
            <span className="font-semibold tabular-nums">1.3x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Segments on target</span>
            <span className="font-semibold tabular-nums">2/4</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {segments.map((segment) => (
            <div key={segment.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{segment.label}</div>
                  <div className="text-muted-foreground text-xs">
                    {segment.pipeline} · {segment.velocity} velocity
                  </div>
                </div>
                <Badge variant="outline" className={cn("uppercase", trendTone[segment.trend])}>
                  {segment.trend}
                </Badge>
              </div>

              <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
                <span>Coverage</span>
                <span className="text-foreground tabular-nums">{segment.coverage}%</span>
              </div>
              <div className="mt-2 flex items-end gap-1">
                {segment.spark.map((value, index) => (
                  <span
                    key={`${segment.id}-${index}`}
                    className="block h-6 w-2 rounded-sm"
                    style={{ backgroundColor: sparkTone(value) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
