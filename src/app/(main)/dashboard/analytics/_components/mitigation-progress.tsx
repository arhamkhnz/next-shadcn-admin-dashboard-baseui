import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const mitigations = [
  { id: "security", label: "Zero-trust rollout", owner: "IT Security", progress: 78, due: "Sep 28" },
  { id: "vendors", label: "Vendor resilience plan", owner: "Operations", progress: 62, due: "Oct 05" },
  { id: "audit", label: "SOX control refresh", owner: "Finance", progress: 44, due: "Oct 12" },
];

export function MitigationProgress() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Mitigation Progress</CardTitle>
          <CardDescription>Active treatments and completion status.</CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">2 overdue</Badge>
            <Button size="sm" variant="outline">
              View actions
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {mitigations.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-muted-foreground text-xs">{item.owner}</div>
              </div>
              <div className="text-muted-foreground text-xs">Due {item.due}</div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Progress value={item.progress} className="h-1.5 flex-1 bg-muted" />
              <span className="text-foreground tabular-nums">{item.progress}%</span>
            </div>
            {index < mitigations.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
