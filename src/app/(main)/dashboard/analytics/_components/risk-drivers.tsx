import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DriverImpact = "high" | "medium" | "low";

const drivers: Array<{
  id: string;
  label: string;
  detail: string;
  impact: DriverImpact;
  delta: string;
}> = [
  { id: "stalled", label: "Stalled in proposal", detail: "12 deals idle > 14 days", impact: "high", delta: "+4" },
  { id: "slips", label: "Close date slips", detail: "8 deals moved out twice", impact: "high", delta: "+2" },
  {
    id: "no-contact",
    label: "No stakeholder response",
    detail: "6 accounts waiting on legal",
    impact: "medium",
    delta: "+1",
  },
  { id: "discounts", label: "Discount pressure", detail: "5 deals > 18% discount", impact: "medium", delta: "+1" },
  {
    id: "handshake",
    label: "Verbal-only commitments",
    detail: "3 deals missing paperwork",
    impact: "low",
    delta: "-1",
  },
];

const impactTone: Record<DriverImpact, string> = {
  high: "border-rose-500/30 text-rose-600",
  medium: "border-amber-500/30 text-amber-600",
  low: "border-emerald-500/30 text-emerald-600",
};

export function RiskDrivers() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Top Risk Drivers</CardTitle>
          <CardDescription>Signals likely to impact pipeline health.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            View playbook
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Signals monitored</span>
            <span className="font-semibold tabular-nums">14</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active alerts</span>
            <span className="font-semibold tabular-nums">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">New this week</span>
            <span className="font-semibold tabular-nums">+2</span>
          </div>
        </div>

        <div className="space-y-3">
          {drivers.map((driver, index) => (
            <div key={driver.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{driver.label}</div>
                  <div className="text-muted-foreground text-xs">{driver.detail}</div>
                </div>
                <Badge variant="outline" className={cn("capitalize", impactTone[driver.impact])}>
                  {driver.impact}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Change vs last week</span>
                <span className="font-medium text-foreground">{driver.delta}</span>
              </div>
              {index < drivers.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
