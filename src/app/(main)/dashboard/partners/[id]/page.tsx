import { RecordDetail } from "@/components/admin/record-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RecordDetail
      title="Partner details"
      description="Company identity, GST, ownership, website, status, and metadata."
      endpoint={`companies/${encodeURIComponent(id)}`}
      backHref="/dashboard/partners"
    />
  );
}
