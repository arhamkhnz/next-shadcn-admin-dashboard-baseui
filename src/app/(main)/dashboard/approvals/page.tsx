import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
import { APPROVAL_ACTIONS } from "@/components/admin/resource-action-configs";
export default function Page() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Four-eyes approval queue for high-risk driver and platform changes. The approver must differ from the requester."
      />
      <OperationsResource
        endpoint="operations/platform/approvals?limit=200"
        columns={[
          "action",
          "status",
          "subjectType",
          "subjectId",
          "requestedBy",
          "requestedAt",
          "decidedBy",
          "decidedAt",
        ]}
        actions={APPROVAL_ACTIONS}
        labelKeys={["action", "subjectType"]}
      />
    </main>
  );
}
