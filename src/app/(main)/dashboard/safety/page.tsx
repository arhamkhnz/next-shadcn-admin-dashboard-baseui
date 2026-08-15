import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
import { FRAUD_SIGNAL_ACTIONS, SAFETY_INCIDENT_ACTIONS } from "@/components/admin/resource-action-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const linkedColumns = {
  riderId: { hrefBase: "/dashboard/drivers" },
  orderId: { hrefBase: "/dashboard/orders" },
};

export default function Page() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Safety & fraud"
        description="SOS incidents, acknowledgement status, active threats, and fraud signals requiring investigation."
      />
      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Triage first</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Open SOS rows expose Acknowledge. It assigns ownership and marks the incident as being handled.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Driver profile jump</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Rider IDs open the driver profile with account, document, trip, order, and safety context.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Incident evidence</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Incidents show order, latitude, longitude, GPS accuracy, owner, and response timestamps in one queue.
          </CardContent>
        </Card>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Safety incidents</h2>
        <OperationsResource
          endpoint="operations/safety/incidents"
          columns={[
            "reasonCode",
            "status",
            "riderId",
            "orderId",
            "latitude",
            "longitude",
            "accuracyM",
            "assignedTo",
            "triggeredAt",
            "acknowledgedAt",
            "resolvedAt",
          ]}
          actions={SAFETY_INCIDENT_ACTIONS}
          labelKeys={["reasonCode"]}
          refreshInterval={10_000}
          linkedColumns={linkedColumns}
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Fraud signals</h2>
        <OperationsResource
          endpoint="operations/platform/fraud-signals?limit=200"
          columns={["type", "severity", "status", "riderId", "orderId", "evidence", "createdAt", "updatedAt"]}
          actions={FRAUD_SIGNAL_ACTIONS}
          labelKeys={["type"]}
          refreshInterval={30_000}
          linkedColumns={linkedColumns}
        />
      </section>
    </main>
  );
}
