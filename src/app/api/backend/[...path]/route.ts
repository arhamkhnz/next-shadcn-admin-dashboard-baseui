import { type NextRequest, NextResponse } from "next/server";

import { isAllowedAdminProxyRequest, isSameOrigin } from "@/lib/api/admin-proxy";
import { ApiClientError, rawBackendRequest } from "@/lib/api/backend";
import type { AdminTokenPair } from "@/lib/api/contracts";
import { clearAdminSessionCookies, readAdminTokens, setAdminSessionCookies } from "@/lib/auth/cookies";

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: Context) {
  const path = (await context.params).path.join("/");
  if (!isAllowedAdminProxyRequest(request.method, path))
    return NextResponse.json({ message: "Resource not allowed." }, { status: 404 });
  if (
    !["GET", "HEAD"].includes(request.method) &&
    !isSameOrigin(request.headers.get("origin"), request.nextUrl.origin)
  ) {
    return NextResponse.json({ message: "Request origin rejected." }, { status: 403 });
  }

  const query = request.nextUrl.search;
  const requestPath = `${path}${query}`;
  const tokens = readAdminTokens(request);
  if (!tokens.accessToken || !tokens.refreshToken)
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const contentType = request.headers.get("content-type");
  const isRead = ["GET", "HEAD"].includes(request.method);
  let body: string | ArrayBuffer | undefined;
  if (!isRead) body = contentType?.startsWith("multipart/") ? await request.arrayBuffer() : await request.text();
  const init: RequestInit = { method: request.method, body: body || undefined };
  if (contentType) init.headers = { "Content-Type": contentType };

  let pair: AdminTokenPair | undefined;
  try {
    let data: unknown;
    try {
      data = await rawBackendRequest(requestPath, init, tokens.accessToken);
    } catch (error) {
      if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
      pair = await rawBackendRequest<AdminTokenPair>("admin/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      data = await rawBackendRequest(requestPath, init, pair.accessToken);
    }
    const response = NextResponse.json(data, { headers: { "Cache-Control": "no-store, private" } });
    if (pair) setAdminSessionCookies(response, pair);
    return response;
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    const response = NextResponse.json(
      {
        message: error instanceof Error ? error.message : "The LiftNGo API is unavailable.",
        code: error instanceof ApiClientError ? error.code : "BACKEND_UNAVAILABLE",
        requestId: error instanceof ApiClientError ? error.requestId : undefined,
      },
      { status },
    );
    if (status === 401) clearAdminSessionCookies(response);
    return response;
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
