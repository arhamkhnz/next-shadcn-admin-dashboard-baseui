import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const funnel = [
  { id: "qualified", label: "Qualified", rate: 100, value: "421", share: 38 },
  { id: "proposal", label: "Proposal", rate: 64, value: "269", share: 24 },
  { id: "negotiation", label: "Negotiation", rate: 41, value: "172", share: 18 },
  { id: "verbal", label: "Verbal", rate: 28, value: "118", share: 12 },
  { id: "won", label: "Won", rate: 22, value: "92", share: 8 },
];

const kpis = [
  { id: "overall", label: "Overall conversion", value: "21.4%" },
  { id: "median", label: "Median cycle", value: "19.4d" },
  { id: "winrate", label: "Win rate", value: "22.1%" },
];

export function ConversionSnapshot() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div>
          <CardTitle>Conversion Snapshot</CardTitle>
          <CardDescription>Stage drop-off at a glance.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            View trends
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Overall conversion</div>
            <div className="mt-2 font-semibold text-4xl tabular-nums">21.4%</div>
            <div className="mt-4 space-y-2 text-sm">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{kpi.label}</span>
                  <span className="font-medium tabular-nums">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Conversion funnel</span>
                <span className="text-muted-foreground">Share of pipeline</span>
              </div>
              <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {funnel.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="h-full"
                    style={{
                      width: `${stage.share}%`,
                      backgroundColor: `var(--chart-${index + 1})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2 text-muted-foreground text-xs sm:grid-cols-2">
              {funnel.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between">
                  <span>{stage.label}</span>
                  <span className="tabular-nums">{stage.value}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="text-sm">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Median cycle</div>
                <div className="mt-1 font-semibold tabular-nums">19.4d</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Win rate</div>
                <div className="mt-1 font-semibold tabular-nums">22.1%</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Lead to proposal</div>
                <div className="mt-1 font-semibold tabular-nums">64%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
