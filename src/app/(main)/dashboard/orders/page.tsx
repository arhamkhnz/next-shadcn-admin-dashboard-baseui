import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Delivery orders"
      description="Monitor partner deliveries, assignment, pickup, drop, exceptions, returns, and completion."
      endpoint="operations/platform/orders?limit=200"
      linkBase="/dashboard/orders"
      columns={["id", "externalOrderId", "state", "riderId", "partnerId", "customerFeePaise", "updatedAt"]}
      refreshInterval={15_000}
    />
  );
}
