import { ConfigurationScreen } from "@/components/admin/configuration-screen";
export default function Page() {
  return (
    <ConfigurationScreen
      title="Service areas"
      description="Control zones, geofences, vehicle availability, capacity, and operating hours."
      keyPlaceholder="serviceArea.jaipur.zone"
      example={
        '{\n  "enabled": true,\n  "vehicleTypes": ["BIKE"],\n  "operatingHours": { "start": "06:00", "end": "23:00" }\n}'
      }
    />
  );
}
