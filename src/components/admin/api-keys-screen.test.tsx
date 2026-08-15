import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiKeysScreen } from "./api-keys-screen";

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("ApiKeysScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates API keys on a separate page and tracks owner, expiry, and last-used metadata", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes("/api/backend/users")) {
        return response({ data: [{ id: "customer-1", firstName: "GVD", lastName: "Partner", mobile: "9355471999" }] });
      }
      if (url.includes("/api/backend/operations/platform/api-keys") && init?.method === "POST") {
        return response({
          id: "key-1",
          name: "Delivery integration",
          key: "lng_live_created_secret",
          keyPrefix: "lng_live_crea",
          userId: "customer-1",
          status: "ACTIVE",
          expiresAt: "2026-09-01T00:00:00.000Z",
          lastUsedAt: null,
        });
      }
      if (url.includes("/api/backend/operations/platform/api-keys")) {
        return response([
          {
            id: "key-existing",
            name: "Existing partner key",
            keyPrefix: "lng_live_old1",
            userId: "customer-1",
            status: "ACTIVE",
            expiresAt: "2026-09-01T00:00:00.000Z",
            lastUsedAt: "2026-08-16T06:00:00.000Z",
            createdBy: "admin",
            createdAt: "2026-08-16T05:00:00.000Z",
          },
          {
            id: "key-never-used",
            name: "Webhook sandbox",
            keyPrefix: "lng_live_nev1",
            userId: "customer-1",
            status: "ACTIVE",
            expiresAt: null,
            lastUsedAt: null,
            createdBy: "admin",
            createdAt: "2026-08-16T05:30:00.000Z",
          },
        ]);
      }
      return response({});
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <ApiKeysScreen />
      </SWRConfig>,
    );

    expect(await screen.findByRole("heading", { name: "API keys" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: /GVD Partner/ })).toBeInTheDocument();
    expect(await screen.findByText("Existing partner key")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
    expect(screen.getAllByText("Last used").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Never used").length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Key name"), "Delivery integration");
    await user.selectOptions(screen.getByLabelText("Owner account"), "customer-1");
    await user.type(screen.getByLabelText("Expires at"), "2026-09-01T00:00");
    await user.click(screen.getByRole("button", { name: "Create API key" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "/api/backend/operations/platform/api-keys",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Delivery integration",
            userId: "customer-1",
            expiresAt: new Date("2026-09-01T00:00").toISOString(),
          }),
        }),
      ),
    );
    expect(await screen.findByText("lng_live_created_secret")).toBeInTheDocument();
  });
});
