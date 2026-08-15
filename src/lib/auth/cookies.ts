import type { NextRequest, NextResponse } from "next/server";

import type { AdminTokenPair } from "@/lib/api/contracts";

import { getAdminCookieNames, getAdminCookieOptions } from "./session";

export function setAdminSessionCookies(response: NextResponse, pair: AdminTokenPair): void {
  const names = getAdminCookieNames();
  response.cookies.set(names.access, pair.accessToken, getAdminCookieOptions(new Date(pair.accessExpiresAt)));
  response.cookies.set(names.refresh, pair.refreshToken, getAdminCookieOptions(new Date(pair.refreshExpiresAt)));
}

export function clearAdminSessionCookies(response: NextResponse): void {
  const names = getAdminCookieNames();
  response.cookies.set(names.access, "", getAdminCookieOptions(new Date(0)));
  response.cookies.set(names.refresh, "", getAdminCookieOptions(new Date(0)));
}

export function readAdminTokens(request: NextRequest) {
  const names = getAdminCookieNames();
  return {
    accessToken: request.cookies.get(names.access)?.value,
    refreshToken: request.cookies.get(names.refresh)?.value,
  };
}
