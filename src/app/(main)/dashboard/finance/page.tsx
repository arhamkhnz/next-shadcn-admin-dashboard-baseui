import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
import { FINANCE_DISPUTE_ACTIONS } from "@/components/admin/resource-action-configs";
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
          columns={["status", "amountPaise", "riderId", "requestedAt", "completedAt", "failureCode"]}
          labelKeys={["status"]}
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Disputes</h2>
        <OperationsResource
          endpoint={endpoint}
          payloadKey="disputes"
          columns={["category", "status", "amountPaise", "riderId", "payoutId", "updatedAt"]}
          actions={FINANCE_DISPUTE_ACTIONS}
          labelKeys={["category"]}
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">COD balances</h2>
        <OperationsResource
          endpoint={endpoint}
          payloadKey="codBalances"
          columns={["status", "balancePaise", "riderId", "updatedAt"]}
        />
      </section>
    </main>
  );
}
