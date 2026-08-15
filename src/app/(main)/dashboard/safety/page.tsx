import { ActionConsole } from "@/components/admin/action-console";
import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
export default function Page() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Safety & fraud"
        description="SOS incidents, acknowledgement status, active threats, and fraud signals requiring investigation."
      />
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Safety incidents</h2>
        <OperationsResource
          endpoint="operations/safety/incidents"
          columns={["id", "riderId", "orderId", "reasonCode", "status", "triggeredAt", "acknowledgedAt", "resolvedAt"]}
          refreshInterval={10_000}
        />
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <ActionConsole
          title="Acknowledge SOS"
          description="Mark an active incident as acknowledged."
          endpoint="operations/safety/incidents/{id}/acknowledge"
          submitLabel="Acknowledge"
        />
        <ActionConsole
          title="Resolve incident"
          description="Close a handled safety incident."
          endpoint="operations/safety/incidents/{id}/resolve"
          submitLabel="Resolve"
        />
        <ActionConsole
          title="Review fraud signal"
          description="Record the investigation outcome."
          endpoint="operations/platform/fraud-signals/{id}/status"
          method="PUT"
          fields={[
            {
              name: "status",
              label: "Status",
              options: ["UNDER_REVIEW", "RESOLVED", "DISMISSED", "RESTRICTION_APPLIED"],
            },
            { name: "reasonCode", label: "Reason code" },
          ]}
        />
      </div>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Fraud signals</h2>
        <OperationsResource
          endpoint="operations/platform/fraud-signals?limit=200"
          columns={["id", "riderId", "type", "severity", "status", "evidence", "createdAt"]}
          refreshInterval={30_000}
        />
      </section>
    </main>
  );
}
