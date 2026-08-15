import { VerificationDetail } from "@/components/admin/verification-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <VerificationDetail driverId={(await params).id} />;
}
