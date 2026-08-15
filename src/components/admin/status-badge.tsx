import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value: unknown }) {
  const text = String(value ?? "Unknown");
  const healthy = /active|online|approved|verified|delivered|complete|success|paid/i.test(text);
  const danger = /failed|rejected|blocked|deactivated|critical|cancel/i.test(text);
  let variant: "destructive" | "default" | "secondary" = "secondary";
  if (danger) variant = "destructive";
  else if (healthy) variant = "default";
  return <Badge variant={variant}>{text.replaceAll("_", " ")}</Badge>;
}
