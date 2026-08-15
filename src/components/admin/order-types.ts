import type { TripLocation } from "./trip-types";

export type OrderContact = {
  name: string;
  mobile?: string;
};

export type AdminOrder = {
  id: string;
  reference: string;
  state: string;
  pickup: TripLocation;
  drop: TripLocation;
  pickupContact: OrderContact;
  dropContact: OrderContact;
  riderId?: string;
  partnerId?: string;
  zoneId?: string;
  distanceMeters?: number;
  customerFeePaise?: number;
  declaredValuePaise?: number;
  itemSummary?: string;
  promisedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  raw: Record<string, unknown>;
};

export type OperationalRouteSubject = {
  id: string;
  label: string;
  pickup: TripLocation;
  destination: TripLocation;
};
