import { cookies } from "next/headers";

import { getAdminCookieNames } from "@/lib/auth/session";

import type { ApiErrorBody } from "./contracts";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly retryAfterSeconds?: number;
  readonly details?: Record<string, unknown>;

  constructor(status: number, body: Partial<ApiErrorBody>) {
    super(body.message_en ?? "The LiftNGo API request failed.");
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code ?? `HTTP_${status}`;
    this.requestId = body.requestId;
    this.retryAfterSeconds = body.retryAfterSeconds;
    this.details = body.details;
  }
}

export async function readBackendResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as Partial<ApiErrorBody> & {
    success?: boolean;
    data?: T;
  };
  if (!response.ok || body.success === false) throw new ApiClientError(response.status, body);
  if (body.success === true && "data" in body) return body.data as T;
  return body as T;
}

export async function rawBackendRequest<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (!baseUrl)
    throw new ApiClientError(500, { code: "BACKEND_URL_MISSING", message_en: "Backend URL is not configured." });
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-Id", crypto.randomUUID());
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  return readBackendResponse<T>(response);
}

export async function backendRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(getAdminCookieNames().access)?.value;
  if (!accessToken) {
    throw new ApiClientError(401, { code: "ADMIN_SESSION_MISSING", message_en: "Sign in to continue." });
  }
  return rawBackendRequest<T>(path, init, accessToken);
}
