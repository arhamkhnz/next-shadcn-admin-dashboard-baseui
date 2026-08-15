import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Audit log"
      description="Immutable trace of sensitive reads, decisions, configuration changes, and operational actions."
      endpoint="operations/platform/audit?limit=200"
      columns={["occurredAt", "actorId", "actorRole", "action", "subjectType", "subjectId", "reasonCode", "requestId"]}
      refreshInterval={30_000}
    />
  );
}
