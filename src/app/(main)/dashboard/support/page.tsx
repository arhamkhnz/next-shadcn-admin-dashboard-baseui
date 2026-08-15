import { ActionConsole } from "@/components/admin/action-console";
import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
export default function Page() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Support"
        description="Prioritised customer, driver, and partner cases with response-SLA visibility."
      />
      <OperationsResource
        endpoint="operations/support/cases"
        columns={["id", "riderId", "orderId", "category", "priority", "status", "slaDueAt", "updatedAt"]}
        refreshInterval={15_000}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <ActionConsole
          title="Reply to case"
          description="Send an audited operations reply to the driver."
          endpoint="operations/support/cases/{id}/messages"
          fields={[{ name: "body", label: "Reply", required: true }]}
          submitLabel="Send reply"
        />
        <ActionConsole
          title="Update case status"
          description="Move a support case through its resolution workflow."
          endpoint="operations/support/cases/{id}/status"
          method="PUT"
          fields={[
            {
              name: "status",
              label: "Status",
              options: ["OPEN", "IN_PROGRESS", "WAITING_ON_RIDER", "RESOLVED", "CLOSED"],
            },
          ]}
        />
      </div>
    </main>
  );
}
