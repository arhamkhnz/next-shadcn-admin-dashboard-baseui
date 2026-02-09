import { AnalyticsOverview } from "./_components/analytics-overview";
import { RevenueCommandGrid } from "./_components/revenue-command-grid";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AnalyticsOverview />
      <RevenueCommandGrid />
    </div>
  );
}
