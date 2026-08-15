import { OperationsResource } from "@/components/admin/operations-resource";
import { PageHeader } from "@/components/admin/page-header";
import { SUPPORT_CASE_ACTIONS } from "@/components/admin/resource-action-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const linkedColumns = {
  riderId: { hrefBase: "/dashboard/drivers" },
  orderId: { hrefBase: "/dashboard/orders" },
};

export default function Page() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Support"
        description="Prioritised customer, driver, and partner cases with response-SLA visibility."
      />
      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">One-click ownership</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Acknowledge case moves an OPEN case into IN_PROGRESS so the queue reflects who started triage.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Open the driver</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Rider IDs are direct links to the driver profile, removing copy/paste before replying or deciding.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA and case detail</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            The queue now shows subject, assignment, related order, SLA due time, and latest update together.
          </CardContent>
        </Card>
      </section>
      <OperationsResource
        endpoint="operations/support/cases"
        columns={[
          "category",
          "subject",
          "priority",
          "status",
          "riderId",
          "orderId",
          "assignedTo",
          "slaDueAt",
          "updatedAt",
          "createdAt",
        ]}
        actions={SUPPORT_CASE_ACTIONS}
        labelKeys={["category", "subject"]}
        refreshInterval={15_000}
        linkedColumns={linkedColumns}
      />
    </main>
  );
}
