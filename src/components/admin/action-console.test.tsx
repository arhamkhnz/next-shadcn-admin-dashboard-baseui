import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActionConsole } from "./action-console";

describe("ActionConsole", () => {
  it("renders friendly choices while submitting stable identifiers", () => {
    render(
      <ActionConsole
        title="Manual driver offer"
        description="Choose an eligible driver."
        fixedId="order-1"
        endpoint="orders/{id}/offer"
        fields={[
          {
            name: "riderId",
            label: "Driver",
            choices: [
              { label: "Meera Singh · RJ14AB1002", value: "rider-2" },
              { label: "Aarav Sharma · RJ14AB1001", value: "rider-1" },
            ],
          },
        ]}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Driver" });
    expect(select).toHaveDisplayValue("Meera Singh · RJ14AB1002");
    expect(screen.getByRole("option", { name: "Aarav Sharma · RJ14AB1001" })).toHaveValue("rider-1");
    expect(screen.queryByLabelText("Record ID")).not.toBeInTheDocument();
  });
});
