export function titleFromKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("en-IN").format(value);
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime()))
      return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  return text;
}

function readableToken(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

export function compactId(value: unknown): string {
  const text = String(value ?? "").trim();
  if (text.length <= 18) return text || "—";
  return `${text.slice(0, 8)}…${text.slice(-5)}`;
}

export function summarizeObject(key: string, value: Record<string, unknown>): string {
  if (key.toLowerCase() === "personal") {
    const parts = [value.fullName ?? value.name, value.operatingLocality ?? value.primaryZoneId]
      .map((part) => String(part ?? "").trim())
      .filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  if (key.toLowerCase() === "vehicle") {
    const parts = [readableToken(value.type), value.registrationNumber]
      .map((part) => String(part ?? "").trim())
      .filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  const count = Object.keys(value).length;
  return count === 1 ? "1 detail" : `${count} details`;
}

export function formatResourceValue(key: string, value: unknown): string {
  if (/paise$/i.test(key) && typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }
  if (Array.isArray(value)) return value.length === 1 ? "1 item" : `${value.length} items`;
  if (typeof value === "object" && value !== null) return summarizeObject(key, value as Record<string, unknown>);
  return displayValue(value);
}

export function recordLabel(row: Record<string, unknown>, preferredKeys: string[] = []): string {
  const personal = row.personal;
  const candidates = [
    ...preferredKeys.map((key) => {
      const value = row[key];
      return typeof value === "object" && value !== null
        ? summarizeObject(key, value as Record<string, unknown>)
        : value;
    }),
    row.name,
    row.tripCode,
    row.entityName,
    row.externalOrderId,
    row.category,
    row.action,
    typeof personal === "object" && personal !== null ? (personal as Record<string, unknown>).fullName : undefined,
    row.mobile,
  ];
  const label = candidates.map((value) => String(value ?? "").trim()).find(Boolean);
  if (label) return label;
  return compactId(row.id ?? row.riderId ?? row.userId ?? "Record");
}

export function rowsFromPayload(payload: unknown, preferredKey?: string): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const object = payload as Record<string, unknown>;
  const candidate = preferredKey ? object[preferredKey] : (object.data ?? object.items ?? object.results);
  return Array.isArray(candidate) ? (candidate as Record<string, unknown>[]) : [];
}
