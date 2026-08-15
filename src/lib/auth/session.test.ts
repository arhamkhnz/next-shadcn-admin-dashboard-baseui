import { describe, expect, it } from "vitest";

import { getAdminCookieNames, getAdminCookieOptions, toPublicAdminSession } from "./session";

describe("admin session boundary", () => {
  const pair = {
    accessToken: "private-access",
    refreshToken: "private-refresh",
    accessExpiresAt: "2026-08-15T10:15:00.000Z",
    refreshExpiresAt: "2026-08-22T10:00:00.000Z",
    user: { id: "admin-1", username: "liftngo.admin", role: "ADMIN" as const },
  };

  it("uses host-only production cookie names and local development names", () => {
    expect(getAdminCookieNames(true)).toEqual({
      access: "__Host-liftngo_admin_access",
      refresh: "__Host-liftngo_admin_refresh",
    });
    expect(getAdminCookieNames(false)).toEqual({ access: "liftngo_admin_access", refresh: "liftngo_admin_refresh" });
  });

  it("creates strict HTTP-only cookie options", () => {
    expect(getAdminCookieOptions(new Date(pair.accessExpiresAt), true)).toMatchObject({
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
    });
  });

  it("never exposes either token in the public session", () => {
    const session = toPublicAdminSession(pair);

    expect(session).toEqual({ user: pair.user, accessExpiresAt: pair.accessExpiresAt });
    expect(JSON.stringify(session)).not.toContain("private-access");
    expect(JSON.stringify(session)).not.toContain("private-refresh");
  });
});
