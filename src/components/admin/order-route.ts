import type { AdminOrder, OperationalRouteSubject, OrderContact } from "./order-types";
import type { TripLocation } from "./trip-types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const result = String(value).trim();
  return result || undefined;
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function location(source: Record<string, unknown>, nestedKeys: string[], prefix: string): TripLocation {
  const nested = nestedKeys.map((key) => record(source[key])).find((value) => Object.keys(value).length) ?? {};
  return {
    address: text(nested.address) ?? text(source[`${prefix}Address`]) ?? "Address unavailable",
    latitude: number(nested.latitude) ?? number(source[`${prefix}Latitude`]) ?? Number.NaN,
    longitude: number(nested.longitude) ?? number(source[`${prefix}Longitude`]) ?? Number.NaN,
  };
}

function contact(source: Record<string, unknown>, nestedKey: string, prefix: string, fallback: string): OrderContact {
  const nested = record(source[nestedKey]);
  return {
    name: text(nested.name) ?? text(nested.contactName) ?? text(source[`${prefix}ContactName`]) ?? fallback,
    mobile:
      text(nested.mobile) ??
      text(nested.maskedMobile) ??
      text(nested.contactMobile) ??
      text(source[`${prefix}ContactMobile`]),
  };
}

export function normaliseOrder(value: unknown): AdminOrder {
  const source = record(value);
  const pricing = record(source.pricingSnapshot);
  const customerQuote = record(pricing.customerQuote);
  return {
    id: text(source.id) ?? "",
    reference: text(source.externalOrderId) ?? text(source.partnerReference) ?? text(source.id) ?? "Delivery order",
    state: text(source.state) ?? text(source.status) ?? "UNKNOWN",
    pickup: location(source, ["pickup", "origin"], "pickup"),
    drop: location(source, ["drop", "destination"], "drop"),
    pickupContact: contact(source, "pickup", "pickup", "Pickup contact unavailable"),
    dropContact: contact(source, "drop", "drop", "Recipient unavailable"),
    riderId: text(source.riderId),
    partnerId: text(source.partnerId),
    zoneId: text(source.zoneId),
    distanceMeters: number(source.deliveryDistanceM) ?? number(source.distanceMeters),
    customerFeePaise:
      number(source.customerFeePaise) ??
      number(customerQuote.totalPaise) ??
      number(customerQuote.customerFeePaise) ??
      number(pricing.customerFeePaise),
    declaredValuePaise: number(source.declaredValuePaise),
    itemSummary: text(source.itemSummary),
    promisedAt: text(source.promisedAt),
    createdAt: text(source.createdAt),
    updatedAt: text(source.updatedAt),
    raw: source,
  };
}

export function orderAsRouteSubject(order: AdminOrder): OperationalRouteSubject {
  return {
    id: order.id,
    label: order.reference,
    pickup: order.pickup,
    destination: order.drop,
  };
}

export function formatPaise(value?: number, currency = "INR"): string {
  if (value === undefined || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value / 100);
}
