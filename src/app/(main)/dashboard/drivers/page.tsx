import { DRIVER_ACTIONS } from "@/components/admin/resource-action-configs";
import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Drivers"
      description="Search every driver, view onboarding state, availability, vehicle, and recent activity."
      endpoint="operations/platform/riders?limit=200"
      linkBase="/dashboard/drivers"
      columns={["personal", "state", "mobile", "vehicle", "createdAt", "updatedAt"]}
      actions={DRIVER_ACTIONS}
      labelKeys={["personal"]}
      refreshInterval={30_000}
    />
  );
}
