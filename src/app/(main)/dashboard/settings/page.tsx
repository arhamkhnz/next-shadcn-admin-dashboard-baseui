import { ConfigurationScreen } from "@/components/admin/configuration-screen";
export default function Page() {
  return (
    <ConfigurationScreen
      title="Settings"
      description="Secure global controls for dispatch, operations, support, safety, and integrations."
      keyPlaceholder="platform.feature.name"
      example={'{\n  "enabled": true\n}'}
    />
  );
}
