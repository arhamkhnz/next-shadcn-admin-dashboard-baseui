import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationsScreen } from "./notifications-screen";

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("NotificationsScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a guided notification workspace and publishes notification JSON", async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      if (init?.method === "POST") return response({ id: "configuration-1" });
      return response([
        {
          id: "notification-1",
          key: "notifications.announcement.service-delay",
          version: 4,
          value: {
            enabled: true,
            title: "Service delay",
            message: "Pickup times may be longer than usual.",
            channel: "PUSH",
            audience: "CUSTOMERS",
          },
          createdAt: "2026-08-16T00:00:00.000Z",
        },
      ]);
    });

    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <NotificationsScreen />
      </SWRConfig>,
    );

    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notification command centre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Service delay alert" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Driver onboarding" }));
    expect(screen.getByLabelText("Configuration key")).toHaveValue("notifications.template.driver-onboarding");
    expect((screen.getByLabelText("Notification JSON") as HTMLTextAreaElement).value).toContain(
      "Complete your documents",
    );

    await user.type(screen.getByLabelText("Change reason"), "OPS-31 update driver onboarding copy");
    fireEvent.change(screen.getByLabelText("Notification JSON"), {
      target: {
        value:
          '{ "enabled": true, "title": "Complete your documents", "message": "Upload your required documents to start receiving trips.", "channel": "PUSH", "audience": "DRIVERS" }',
      },
    });
    await user.click(screen.getByRole("button", { name: "Publish notification" }));

    await waitFor(() =>
      expect(
        request.mock.calls.some(
          ([url, init]) => url === "/api/backend/operations/platform/configurations" && init?.method === "POST",
        ),
      ).toBe(true),
    );
    const postCall = request.mock.calls.find(
      ([url, init]) => url === "/api/backend/operations/platform/configurations" && init?.method === "POST",
    );
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({
      key: "notifications.template.driver-onboarding",
      value: {
        enabled: true,
        title: "Complete your documents",
        message: "Upload your required documents to start receiving trips.",
        channel: "PUSH",
        audience: "DRIVERS",
      },
      scope: { domain: "notifications" },
      effectiveFrom: expect.any(String),
      changeReason: "OPS-31 update driver onboarding copy",
    });
  });
});
