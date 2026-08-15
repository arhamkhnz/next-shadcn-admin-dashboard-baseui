import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Driver verification"
      description="Review pending driver identity, vehicle, licence, bank, liveness, and uploaded documents."
      endpoint="drivers/verification/pending?limit=100"
      linkBase="/dashboard/verification"
      linkIdKey="userId"
      columns={[
        "userId",
        "vehicleType",
        "vehicleNumber",
        "licenseNumber",
        "isVerified",
        "rating",
        "totalTrips",
        "updatedAt",
      ]}
      emptyMessage="No drivers are waiting for verification."
    />
  );
}
