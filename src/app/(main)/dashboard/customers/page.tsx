import { ResourceScreen } from "@/components/admin/resource-screen";
import { CUSTOMERS_ENDPOINT } from "@/lib/api/customer-query";

export default function Page() {
  return (
    <ResourceScreen
      title="Customers"
      description="All customer accounts, contact details, roles, status, and account history."
      endpoint={CUSTOMERS_ENDPOINT}
      linkBase="/dashboard/customers"
      columns={["firstName", "lastName", "mobile", "status", "email", "role", "createdAt"]}
      labelKeys={["firstName", "lastName", "mobile"]}
    />
  );
}
