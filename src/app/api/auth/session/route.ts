import { type NextRequest, NextResponse } from "next/server";

import { rawBackendRequest } from "@/lib/api/backend";
import type { AdminIdentity } from "@/lib/api/contracts";
import { readAdminTokens } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const { accessToken } = readAdminTokens(request);
  if (!accessToken) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  try {
    const user = await rawBackendRequest<AdminIdentity>("admin/auth/me", {}, accessToken);
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }
}
