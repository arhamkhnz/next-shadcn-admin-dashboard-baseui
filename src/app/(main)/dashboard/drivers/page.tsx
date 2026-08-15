import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Drivers"
      description="Search every driver, view onboarding state, availability, vehicle, and recent activity."
      endpoint="operations/platform/riders?limit=200"
      linkBase="/dashboard/drivers"
      columns={["id", "state", "mobile", "personal", "vehicle", "createdAt", "updatedAt"]}
      refreshInterval={30_000}
    />
  );
}
