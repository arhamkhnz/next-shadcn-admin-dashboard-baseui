"use client";

import { type FormEvent, useState } from "react";

import { Plus } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

const tripEndpoint = "/api/backend/trips?limit=100";
type Customer = { id: string; firstName?: string; lastName?: string; mobile: string };

export function TripsScreen() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: customers } = useSWR<{ data: Customer[] }>(
    open ? "/api/backend/users?limit=100&filter.role=$eq:CUSTOMER" : null,
    (url: string) => fetch(url).then((response) => response.json()),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const values = new FormData(event.currentTarget);
    const number = (key: string) => Number(values.get(key));
    const body = {
      customerId: values.get("customerId"),
      vehicleType: values.get("vehicleType"),
      origin: {
        address: values.get("originAddress"),
        latitude: number("originLatitude"),
        longitude: number("originLongitude"),
      },
      destination: {
        address: values.get("destinationAddress"),
        latitude: number("destinationLatitude"),
        longitude: number("destinationLongitude"),
      },
      receiver: { name: values.get("receiverName"), mobile: values.get("receiverMobile") },
    };
    const response = await fetch("/api/backend/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      setMessage(result.message ?? "Trip could not be created.");
      return;
    }
    setOpen(false);
    await mutate(tripEndpoint);
  }

  const action = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Create trip
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create customer trip</DialogTitle>
          <DialogDescription>
            Select the customer and enter verified pickup, destination, receiver, and vehicle information.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <NativeSelect id="customerId" name="customerId" required className="w-full">
              <NativeSelectOption value="">Select a customer</NativeSelectOption>
              {customers?.data?.map((customer) => (
                <NativeSelectOption
                  key={customer.id}
                  value={customer.id}
                >{`${customer.firstName ?? ""} ${customer.lastName ?? ""} · ${customer.mobile}`}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle</Label>
            <NativeSelect id="vehicleType" name="vehicleType" required>
              <NativeSelectOption value="BIKE">Bike</NativeSelectOption>
              <NativeSelectOption value="AUTO">Auto</NativeSelectOption>
              <NativeSelectOption value="MINI_TRUCK">Mini truck</NativeSelectOption>
              <NativeSelectOption value="TRUCK">Truck</NativeSelectOption>
            </NativeSelect>
          </div>
          <Field label="Pickup address" name="originAddress" required className="sm:col-span-2" />
          <Field label="Pickup latitude" name="originLatitude" type="number" step="any" required />
          <Field label="Pickup longitude" name="originLongitude" type="number" step="any" required />
          <Field label="Destination address" name="destinationAddress" required className="sm:col-span-2" />
          <Field label="Destination latitude" name="destinationLatitude" type="number" step="any" required />
          <Field label="Destination longitude" name="destinationLongitude" type="number" step="any" required />
          <Field label="Receiver name" name="receiverName" required />
          <Field label="Receiver mobile" name="receiverMobile" inputMode="tel" required />
          {message ? (
            <p className="text-destructive text-sm sm:col-span-2" role="alert">
              {message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <main className="space-y-6">
      <PageHeader
        title="Customer trips"
        description="View every trip, create one for a customer, and monitor assignment through delivery."
        action={action}
      />
      <OperationsResource
        endpoint="trips?limit=100"
        columns={[
          "tripCode",
          "status",
          "customerId",
          "driverId",
          "vehicleType",
          "originAddress",
          "destinationAddress",
          "estimatedFare",
          "createdAt",
        ]}
        refreshInterval={15_000}
        linkBase="/dashboard/trips"
      />
    </main>
  );
}

function Field({
  label,
  name,
  className,
  ...props
}: { label: string; name: string; className?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
