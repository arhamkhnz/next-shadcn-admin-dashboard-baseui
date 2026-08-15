import { type NextRequest, NextResponse } from "next/server";

import { rawBackendRequest } from "@/lib/api/backend";
import { clearAdminSessionCookies, readAdminTokens } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Request origin rejected." }, { status: 403 });
  const { refreshToken } = readAdminTokens(request);
  if (refreshToken) {
    await rawBackendRequest("admin/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }).catch(
      () => undefined,
    );
  }
  const response = NextResponse.json({ loggedOut: true }, { headers: { "Cache-Control": "no-store" } });
  clearAdminSessionCookies(response);
  return response;
}
