"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stages = [
  { id: "new", label: "New", count: 420, rate: 100, share: 38, trend: "up" as const, delta: "+12%" },
  { id: "qualified", label: "Qualified", count: 262, rate: 62, share: 24, trend: "down" as const, delta: "-5%" },
  { id: "demo", label: "Demo", count: 146, rate: 35, share: 18, trend: "up" as const, delta: "+3%" },
  { id: "proposal", label: "Proposal", count: 84, rate: 20, share: 12, trend: "up" as const, delta: "+1%" },
  { id: "closed", label: "Closed", count: 38, rate: 9, share: 8, trend: "down" as const, delta: "-2%" },
];

export function StageConversion() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Stage Conversion</CardTitle>
          <CardDescription>Drop-off by stage with week-over-week movement.</CardDescription>
        </div>
        <CardAction>
          <Badge variant="secondary">Last 30 days</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Pipeline distribution</span>
            <span className="text-muted-foreground">Share of pipeline</span>
          </div>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="h-full"
                style={{ width: `${stage.share}%`, backgroundColor: `var(--chart-${index + 1})` }}
                aria-label={`${stage.label} ${stage.share}%`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-muted-foreground">{stage.count} deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">{stage.rate}%</span>
                  <span className={stage.trend === "up" ? "text-emerald-600" : "text-destructive"}>
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
      </CardContent>
    </Card>
  );
}
