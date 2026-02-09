import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const heatmap = [
  ["low", "low", "medium", "medium", "high"],
  ["low", "low", "medium", "medium", "high"],
  ["low", "medium", "medium", "high", "high"],
  ["medium", "medium", "high", "high", "critical"],
  ["medium", "high", "high", "critical", "critical"],
] as const;

const riskTone: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-600",
  medium: "bg-amber-500/20 text-amber-600",
  high: "bg-rose-500/25 text-rose-600",
  critical: "bg-rose-600/35 text-rose-700",
};

export function RiskHeatmap() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Risk Heat Map</CardTitle>
          <CardDescription>Likelihood vs impact across active risks.</CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Risk score 72</Badge>
            <Button size="sm" variant="outline">
              View risks
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
          <div className="grid grid-cols-6 gap-1 text-muted-foreground text-xs">
            <div />
            {["Low", "Mid", "High", "Severe", "Extreme"].map((label) => (
              <div key={label} className="text-center">
                {label}
              </div>
            ))}
            {["Very Likely", "Likely", "Possible", "Unlikely", "Rare"].map((label, row) => (
              <div key={label} className="contents">
                <div className="flex items-center justify-end pr-2">{label}</div>
                {heatmap[row].map((cell, col) => (
                  <div
                    key={`${label}-${col}`}
                    className={cn("h-10 rounded-md border font-medium text-[11px]", riskTone[cell])}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="space-y-3">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Critical exposure</div>
                <div className="mt-1 font-semibold text-2xl tabular-nums">8 risks</div>
                <div className="text-muted-foreground text-xs">+2 since last month</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Residual risk</div>
                <div className="mt-1 font-semibold text-2xl tabular-nums">41</div>
                <div className="text-muted-foreground text-xs">after mitigations</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                <Badge variant="outline">Inherent 68</Badge>
                <Badge variant="outline">Residual 41</Badge>
                <Badge variant="outline">Controls 82%</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <span className="font-medium">Legend</span>
          <Badge variant="outline" className={riskTone.low}>
            Low
          </Badge>
          <Badge variant="outline" className={riskTone.medium}>
            Medium
          </Badge>
          <Badge variant="outline" className={riskTone.high}>
            High
          </Badge>
          <Badge variant="outline" className={riskTone.critical}>
            Critical
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
