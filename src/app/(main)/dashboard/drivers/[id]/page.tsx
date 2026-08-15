import { DriverDetail } from "@/components/admin/driver-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <DriverDetail riderId={(await params).id} />;
}
