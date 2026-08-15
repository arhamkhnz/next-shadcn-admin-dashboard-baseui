import { ActionConsole } from "@/components/admin/action-console";
import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
export default function Page() {
  const endpoint = "operations/platform/finance?limit=200";
  return (
    <main className="space-y-6">
      <PageHeader
        title="Finance"
        description="Payouts, verified destinations, disputes, wallet liability, and cash-on-delivery balances."
      />
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Payouts</h2>
        <OperationsResource
          endpoint={endpoint}
          payloadKey="payouts"
          columns={["id", "riderId", "amountPaise", "status", "requestedAt", "completedAt", "failureCode"]}
        />
      </section>
      <ActionConsole
        title="Resolve financial dispute"
        description="Record the reviewed status, reason, and note for a payout dispute."
        endpoint="operations/platform/finance/disputes/{id}/status"
        method="PUT"
        fields={[
          { name: "status", label: "Status", options: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] },
          { name: "reasonCode", label: "Reason code" },
          { name: "note", label: "Review note" },
        ]}
      />
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Disputes</h2>
        <OperationsResource
          endpoint={endpoint}
          payloadKey="disputes"
          columns={["id", "riderId", "payoutId", "category", "amountPaise", "status", "updatedAt"]}
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">COD balances</h2>
        <OperationsResource
          endpoint={endpoint}
          payloadKey="codBalances"
          columns={["riderId", "balancePaise", "status", "updatedAt"]}
        />
      </section>
    </main>
  );
}
