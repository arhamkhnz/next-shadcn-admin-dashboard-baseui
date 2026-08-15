export type TripLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

export type TripPerson = {
  id?: string;
  name: string;
  mobile?: string;
  email?: string;
};

export type AdminTrip = {
  id: string;
  tripCode: string;
  status: string;
  pickup: TripLocation;
  destination: TripLocation;
  customer?: TripPerson;
  driver?: TripPerson;
  customerId?: string;
  driverId?: string;
  vehicleType: string;
  vehicleSubType?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  fare?: number;
  actualFare?: number;
  currency: string;
  bookingType?: string;
  paymentStatus?: string;
  businessName?: string;
  receiverName?: string;
  receiverMobile?: string;
  cancellationReason?: string;
  cancellationReasonOther?: string;
  cancelledBy?: string;
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string;
  acceptedAt?: string;
  driverArrivedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  raw: Record<string, unknown>;
};

export type TripRoute = {
  positions: [number, number][];
  distanceMeters?: number;
  durationSeconds?: number;
  approximate: boolean;
};

export type TripDriverLocation = {
  name: string;
  latitude: number;
  longitude: number;
  online: boolean;
  capturedAt?: string;
  accuracyM?: number;
};

export type LocationInspector = {
  label: string;
  address: string;
  coordinates: string;
  meta?: string;
};
