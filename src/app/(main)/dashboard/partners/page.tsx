import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Partners"
      description="Companies and partner accounts connected to LiftNGo delivery operations."
      endpoint="companies?limit=100"
      linkBase="/dashboard/partners"
      columns={["id", "entityName", "gstin", "officialWebsite", "status", "userId", "createdAt"]}
    />
  );
}
