import { ActionConsole } from "@/components/admin/action-console";
import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
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
          "id",
          "action",
          "subjectType",
          "subjectId",
          "status",
          "requestedBy",
          "requestedAt",
          "decidedBy",
          "decidedAt",
        ]}
      />
      <ActionConsole
        title="Approve pending request"
        description="Apply a pending high-risk change after independent review."
        endpoint="operations/platform/approvals/{id}/approve"
        fields={[{ name: "reasonCode", label: "Decision reason", placeholder: "APPROVED_AFTER_REVIEW" }]}
        submitLabel="Approve request"
      />
    </main>
  );
}
