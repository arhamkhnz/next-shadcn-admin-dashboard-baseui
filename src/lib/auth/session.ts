import type { AdminTokenPair, PublicAdminSession } from "@/lib/api/contracts";

export function getAdminCookieNames(isProduction = process.env.NODE_ENV === "production") {
  const prefix = isProduction ? "__Host-" : "";
  return {
    access: `${prefix}liftngo_admin_access`,
    refresh: `${prefix}liftngo_admin_refresh`,
  } as const;
}

export function getAdminCookieOptions(expires: Date, isProduction = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction,
    path: "/",
    expires,
  };
}

export function toPublicAdminSession(pair: AdminTokenPair): PublicAdminSession {
  return { user: pair.user, accessExpiresAt: pair.accessExpiresAt };
}
