import { ActionConsole } from "@/components/admin/action-console";
import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safe = encodeURIComponent(id);
  return (
    <main className="space-y-6">
      <PageHeader
        title="Delivery order activity"
        description={`Assignment offers, lifecycle transitions, exceptions, and interventions for ${id}.`}
      />
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Timeline</h2>
        <OperationsResource
          endpoint={`operations/platform/orders/${safe}/timeline`}
          columns={["occurredAt", "fromState", "toState", "actorType", "actorId", "reasonCode", "metadata"]}
          refreshInterval={10_000}
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Driver offers</h2>
        <OperationsResource
          endpoint={`operations/platform/orders/${safe}/offers`}
          columns={["id", "riderId", "status", "offeredAt", "respondedAt", "expiresAt", "reasonCode"]}
          refreshInterval={10_000}
        />
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <ActionConsole
          fixedId={id}
          title="Manual driver offer"
          description="Offer this order to a specific eligible driver."
          endpoint="operations/platform/orders/{id}/manual-offer"
          fields={[
            { name: "riderId", label: "Driver ID" },
            { name: "reasonCode", label: "Reason code" },
          ]}
        />
        <ActionConsole
          fixedId={id}
          title="Confirm estimated route"
          description="Confirm a fallback route before dispatch."
          endpoint="operations/platform/orders/{id}/fallback-route/confirm"
          fields={[{ name: "reasonCode", label: "Reason code" }]}
        />
        <ActionConsole
          fixedId={id}
          title="Resolve pickup exception"
          description="Release an order after resolving its pickup exception."
          endpoint="operations/platform/orders/{id}/pickup-exception/resolve"
          fields={[{ name: "reasonCode", label: "Reason code" }]}
        />
        <ActionConsole
          fixedId={id}
          title="Approve wrong-address requote"
          description="Approve updated route and pricing after an address correction."
          endpoint="operations/platform/orders/{id}/wrong-address/approve"
          fields={[{ name: "reasonCode", label: "Reason code" }]}
        />
      </div>
    </main>
  );
}
