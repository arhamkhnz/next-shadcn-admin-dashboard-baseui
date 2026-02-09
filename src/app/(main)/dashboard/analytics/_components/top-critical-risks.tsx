import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium";

const risks: Array<{
  id: string;
  title: string;
  owner: string;
  due: string;
  impact: string;
  severity: Severity;
}> = [
  {
    id: "supply",
    title: "Supplier disruption",
    owner: "Ops · M. Reyes",
    due: "3 days",
    impact: "$240k",
    severity: "critical",
  },
  { id: "data", title: "Data access drift", owner: "IT · A. Chen", due: "5 days", impact: "$180k", severity: "high" },
  {
    id: "contract",
    title: "Contract renewal delay",
    owner: "Legal · J. Singh",
    due: "7 days",
    impact: "$140k",
    severity: "high",
  },
  {
    id: "fraud",
    title: "Payment anomaly",
    owner: "Finance · R. Patel",
    due: "9 days",
    impact: "$92k",
    severity: "medium",
  },
];

const tone: Record<Severity, string> = {
  critical: "border-rose-600/30 text-rose-600",
  high: "border-rose-500/25 text-rose-600",
  medium: "border-amber-500/25 text-amber-600",
};

export function TopCriticalRisks() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Top Critical Risks</CardTitle>
          <CardDescription>Highest impact risks requiring action.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Open register
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk, index) => (
          <div key={risk.id} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{risk.title}</div>
                <div className="text-muted-foreground text-xs">{risk.owner}</div>
              </div>
              <Badge variant="outline" className={cn("uppercase", tone[risk.severity])}>
                {risk.severity}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>
                Due <span className="text-foreground">{risk.due}</span>
              </span>
              <span className="font-medium text-foreground tabular-nums">{risk.impact}</span>
            </div>
            {index < risks.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
