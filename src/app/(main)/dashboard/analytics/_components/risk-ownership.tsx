import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const owners = [
  { id: "it", label: "IT & Security", risks: 12, share: 38 },
  { id: "ops", label: "Operations", risks: 8, share: 26 },
  { id: "finance", label: "Finance", risks: 6, share: 18 },
  { id: "legal", label: "Legal", risks: 5, share: 14 },
];

export function RiskOwnership() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Risk Ownership</CardTitle>
          <CardDescription>Accountability by department.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            View owners
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <Badge variant="secondary">31 open risks</Badge>
          <Badge variant="outline">4 departments</Badge>
        </div>
        {owners.map((owner) => (
          <div key={owner.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{owner.label}</span>
              <span className="text-muted-foreground tabular-nums">{owner.risks}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Progress value={owner.share} className="h-1.5 flex-1 bg-muted" />
              <span className="text-foreground tabular-nums">{owner.share}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
