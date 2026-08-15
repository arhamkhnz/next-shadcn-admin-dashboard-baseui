import { TripDetail } from "@/components/admin/trip-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetail tripId={id} />;
}
