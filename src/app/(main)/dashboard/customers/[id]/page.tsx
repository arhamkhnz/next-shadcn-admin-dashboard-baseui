import { ActionConsole } from "@/components/admin/action-console";
import { RecordDetail } from "@/components/admin/record-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="space-y-6">
      <RecordDetail
        title="Customer details"
        description="Profile, contact, role, status, and account metadata."
        endpoint={`users/${encodeURIComponent(id)}`}
        backHref="/dashboard/customers"
      />
      <ActionConsole
        fixedId={id}
        title="Account access"
        description="Activate or deactivate this customer account."
        endpoint="users/{id}/activate-deactivate"
        method="PATCH"
        fields={[{ name: "activate", label: "Account state", options: ["true", "false"], valueType: "boolean" }]}
      />
    </main>
  );
}
