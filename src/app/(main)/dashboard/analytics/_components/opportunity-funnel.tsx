import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const funnelStages = [
  { id: "qualified", label: "Qualified", amount: "$1.2M", deals: 48, share: 38, color: "var(--chart-1)" },
  { id: "proposal", label: "Proposal", amount: "$760k", deals: 31, share: 24, color: "var(--chart-2)" },
  { id: "negotiation", label: "Negotiation", amount: "$420k", deals: 18, share: 18, color: "var(--chart-3)" },
  { id: "verbal", label: "Verbal", amount: "$210k", deals: 9, share: 12, color: "var(--chart-4)" },
  { id: "won", label: "Closed Won", amount: "$124k", deals: 5, share: 8, color: "var(--chart-5)" },
];

export function OpportunityFunnel() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Opportunity Funnel</CardTitle>
          <CardDescription>Pipeline distribution across stages.</CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Last 30 days</Badge>
            <Button size="sm" variant="outline">
              View details
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Win rate</div>
            <div className="mt-2 font-semibold text-2xl tabular-nums">21.4%</div>
            <div className="text-muted-foreground text-xs">+2.1% vs last month</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Avg deal size</div>
            <div className="mt-2 font-semibold text-2xl tabular-nums">$28.7k</div>
            <div className="text-muted-foreground text-xs">Stable over 8 weeks</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">New opportunities</div>
            <div className="mt-2 font-semibold text-2xl tabular-nums">126</div>
            <div className="text-muted-foreground text-xs">+18% MoM</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Stage distribution</span>
            <span className="text-muted-foreground">Share of pipeline</span>
          </div>
          <Separator />
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {funnelStages.map((stage) => (
              <div
                key={stage.id}
                className="h-full"
                style={{ width: `${stage.share}%`, backgroundColor: stage.color }}
                aria-label={`${stage.label} ${stage.share}%`}
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span>{stage.label}</span>
                </div>
                <span>
                  {stage.deals} deals · <span className="text-foreground tabular-nums">{stage.amount}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
