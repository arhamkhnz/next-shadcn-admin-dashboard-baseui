import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";

import { ResourceActions } from "./resource-actions";

describe("ResourceActions", () => {
  afterEach(() => {
    toast.close();
    cleanup();
    vi.restoreAllMocks();
  });

  it("submits an action for the selected row without an ID field", async () => {
    const user = userEvent.setup();
    const onCompleted = vi.fn();
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(
      <ResourceActions
        row={{ id: "case-1", category: "Payment delay" }}
        labelKeys={["category"]}
        onCompleted={onCompleted}
        actions={[
          {
            id: "reply",
            label: "Reply to case",
            endpoint: "operations/support/cases/{id}/messages",
            fields: [{ name: "body", label: "Reply" }],
            submitLabel: "Send reply",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions for Payment delay" }));
    await user.click(await screen.findByRole("menuitem", { name: "Reply to case" }));

    expect(screen.queryByLabelText(/record id/i)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Reply"), "We have resolved the issue.");
    await user.click(screen.getByRole("button", { name: "Send reply" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "/api/backend/operations/support/cases/case-1/messages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ body: "We have resolved the issue." }),
        }),
      ),
    );
    expect(onCompleted).toHaveBeenCalledOnce();
  });

  it("requires confirmation for a destructive row action", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    render(
      <ResourceActions
        row={{ id: "incident-1", reasonCode: "SOS" }}
        labelKeys={["reasonCode"]}
        actions={[
          {
            id: "resolve",
            label: "Resolve incident",
            endpoint: "operations/safety/incidents/{id}/resolve",
            variant: "destructive",
            submitLabel: "Resolve incident",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions for SOS" }));
    await user.click(await screen.findByRole("menuitem", { name: "Resolve incident" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("SOS");
    expect(screen.getByRole("button", { name: "Resolve incident" })).toBeInTheDocument();
  });

  it("submits static action body values for quick workflow actions", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    render(
      <ResourceActions
        row={{ id: "case-1", category: "ORDER_HELP", status: "OPEN" }}
        labelKeys={["category"]}
        actions={[
          {
            id: "acknowledge",
            label: "Acknowledge case",
            endpoint: "operations/support/cases/{id}/status",
            method: "PUT",
            body: { status: "IN_PROGRESS" },
            submitLabel: "Acknowledge case",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions for ORDER_HELP" }));
    await user.click(await screen.findByRole("menuitem", { name: "Acknowledge case" }));
    await user.click(screen.getByRole("button", { name: "Acknowledge case" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "/api/backend/operations/support/cases/case-1/status",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        }),
      ),
    );
  });
});
