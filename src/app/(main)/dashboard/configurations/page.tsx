import { ConfigurationScreen } from "@/components/admin/configuration-screen";
export default function Page() {
  return (
    <ConfigurationScreen
      title="Platform configurations"
      description="Versioned operational, dispatch, pricing, payout, and policy controls."
      keyPlaceholder="dispatch.offer.timeout"
      example={'{\n  "seconds": 20\n}'}
    />
  );
}
