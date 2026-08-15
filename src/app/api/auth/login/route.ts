import { type NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ApiClientError, rawBackendRequest } from "@/lib/api/backend";
import type { AdminTokenPair } from "@/lib/api/contracts";
import { setAdminSessionCookies } from "@/lib/auth/cookies";
import { toPublicAdminSession } from "@/lib/auth/session";

const inputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/),
  password: z.string().min(14).max(200),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Request origin rejected." }, { status: 403 });
  const input = inputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ message: "Check your username and password." }, { status: 400 });
  try {
    const pair = await rawBackendRequest<AdminTokenPair>("admin/auth/login", {
      method: "POST",
      body: JSON.stringify(input.data),
    });
    const response = NextResponse.json(toPublicAdminSession(pair), { headers: { "Cache-Control": "no-store" } });
    setAdminSessionCookies(response, pair);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          requestId: error.requestId,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json({ message: "The admin service is unavailable." }, { status: 503 });
  }
}
