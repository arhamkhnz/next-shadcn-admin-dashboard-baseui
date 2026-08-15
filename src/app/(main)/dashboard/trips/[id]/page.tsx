import { RecordDetail } from "@/components/admin/record-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RecordDetail
      title="Trip details"
      description="Complete customer trip, driver, route, fare, payment, cancellation, and timestamps."
      endpoint={`trips/${encodeURIComponent(id)}`}
      backHref="/dashboard/trips"
    />
  );
}
