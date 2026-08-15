import { ConfigurationScreen } from "@/components/admin/configuration-screen";
export default function Page() {
  return (
    <ConfigurationScreen
      title="Promotions"
      description="Create and control coupon, referral, incentive, and campaign rules."
      keyPlaceholder="promotions.campaign.code"
      example={'{\n  "enabled": true,\n  "code": "",\n  "discountPercent": 10,\n  "usageLimit": 100\n}'}
    />
  );
}
