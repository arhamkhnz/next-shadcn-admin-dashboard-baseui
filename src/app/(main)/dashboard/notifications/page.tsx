import { ConfigurationScreen } from "@/components/admin/configuration-screen";
export default function Page() {
  return (
    <ConfigurationScreen
      title="Notifications"
      description="Manage operational announcements, routing rules, templates, and notification controls."
      keyPlaceholder="notifications.announcement.active"
      example={'{\n  "enabled": true,\n  "title": "",\n  "message": ""\n}'}
    />
  );
}
