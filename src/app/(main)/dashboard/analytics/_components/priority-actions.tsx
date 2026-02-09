import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RiskLevel = "high" | "medium" | "low";

const focusItems: Array<{
  id: string;
  account: string;
  owner: string;
  nextStep: string;
  due: string;
  risk: RiskLevel;
}> = [
  {
    id: "atlas",
    account: "Atlas Freight",
    owner: "M. Reyes",
    nextStep: "Finalize legal review",
    due: "Tomorrow",
    risk: "high",
  },
  {
    id: "nova",
    account: "Nova Systems",
    owner: "A. Chen",
    nextStep: "Security questionnaire",
    due: "In 3 days",
    risk: "medium",
  },
  {
    id: "summit",
    account: "Summit Labs",
    owner: "J. Singh",
    nextStep: "Schedule exec demo",
    due: "In 5 days",
    risk: "low",
  },
];

const riskTone: Record<RiskLevel, string> = {
  high: "border-rose-500/30 text-rose-600",
  medium: "border-amber-500/30 text-amber-600",
  low: "border-emerald-500/30 text-emerald-600",
};

export function PriorityActions() {
  return (
    <Card className="flex h-full flex-col shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Priority Actions</CardTitle>
          <CardDescription>Follow-ups that keep the pipeline moving.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Open queue
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due this week</span>
            <span className="font-semibold tabular-nums">12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Unassigned</span>
            <span className="font-semibold tabular-nums">2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">High risk</span>
            <span className="font-semibold tabular-nums">3</span>
          </div>
        </div>

        <div className="space-y-3">
          {focusItems.map((item, index) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold">{item.account}</div>
                  <div className="text-muted-foreground text-xs">
                    Owner: <span className="text-foreground">{item.owner}</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn("capitalize", riskTone[item.risk])}>
                  {item.risk} risk
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
                <span>
                  Next: <span className="text-foreground">{item.nextStep}</span>
                </span>
                <span className="font-medium text-foreground">{item.due}</span>
              </div>
              {index < focusItems.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
