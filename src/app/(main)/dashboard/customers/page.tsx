import { ResourceScreen } from "@/components/admin/resource-screen";
export default function Page() {
  return (
    <ResourceScreen
      title="Customers"
      description="All customer accounts, contact details, roles, status, and account history."
      endpoint="users?limit=100&filter.role=$eq:CUSTOMER"
      linkBase="/dashboard/customers"
      columns={["id", "firstName", "lastName", "mobile", "email", "role", "status", "createdAt"]}
    />
  );
}
