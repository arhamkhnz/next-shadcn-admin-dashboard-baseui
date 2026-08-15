import { type NextRequest, NextResponse } from "next/server";

import { readBackendResponse } from "@/lib/api/backend";
import type { AdminTokenPair } from "@/lib/api/contracts";
import { clearAdminSessionCookies, readAdminTokens, setAdminSessionCookies } from "@/lib/auth/cookies";

export async function proxy(request: NextRequest) {
  const { accessToken, refreshToken } = readAdminTokens(request);
  if (request.nextUrl.pathname === "/login") {
    if (accessToken || refreshToken) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }
  if (accessToken) return NextResponse.next();
  if (refreshToken) {
    try {
      const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
      if (!baseUrl) throw new Error("BACKEND_URL_MISSING");
      const backendResponse = await fetch(`${baseUrl}/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Request-Id": crypto.randomUUID() },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      const pair = await readBackendResponse<AdminTokenPair>(backendResponse);
      const response = NextResponse.next();
      setAdminSessionCookies(response, pair);
      return response;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearAdminSessionCookies(response);
      return response;
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
