import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ResourceTable } from "./resource-table";

describe("ResourceTable", () => {
  const row = {
    id: "f8a2a31f-53af-4888-aedc-290e7f3abb8a",
    state: "ACTIVE_OFFLINE",
    personal: { fullName: "Nanban", operatingLocality: "C Scheme" },
    vehicle: { type: "ELECTRIC_TWO_WHEELER", registrationNumber: "RJ14NG8580" },
    amountPaise: 12345,
  };

  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders human-readable values instead of raw backend JSON", () => {
    render(<ResourceTable rows={[row]} columns={["personal", "vehicle", "state", "amountPaise"]} />);

    expect(screen.queryByText(/"fullName"/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Nanban · C Scheme").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Electric two wheeler · RJ14NG8580").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹123.45").length).toBeGreaterThan(0);
  });

  it("provides a narrow-screen summary with the same record actions", () => {
    render(
      <ResourceTable
        rows={[row]}
        columns={["personal", "vehicle", "state"]}
        labelKeys={["personal"]}
        actions={[
          {
            id: "suspend",
            label: "Suspend driver",
            endpoint: "operations/platform/riders/{id}/state",
            fields: [{ name: "reasonCode", label: "Reason" }],
          },
        ]}
      />,
    );

    const mobileList = screen.getByTestId("mobile-resource-list");
    expect(within(mobileList).getAllByText("Nanban · C Scheme").length).toBeGreaterThan(0);
    expect(within(mobileList).getByRole("button", { name: "Actions for Nanban · C Scheme" })).toBeInTheDocument();
  });

  it("switches to a grid and restores that layout only for the current tab", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/dashboard/customers");
    const view = render(<ResourceTable rows={[row]} columns={["personal", "vehicle", "state"]} />);

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    expect(screen.getByTestId("resource-grid")).toBeInTheDocument();
    expect(localStorage.getItem("liftngo:record-layout:/dashboard/customers")).toBe("grid");

    view.unmount();
    render(<ResourceTable rows={[row]} columns={["personal", "vehicle", "state"]} />);
    expect(await screen.findByTestId("resource-grid")).toBeInTheDocument();

    cleanup();
    window.history.replaceState({}, "", "/dashboard/drivers");
    render(<ResourceTable rows={[row]} columns={["personal", "vehicle", "state"]} />);
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
  });

  it("offers CSV export for the currently visible records", () => {
    render(<ResourceTable rows={[row]} columns={["personal", "vehicle", "state"]} exportFilename="drivers" />);

    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });
});
