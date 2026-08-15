import { describe, expect, it } from "vitest";

import { ApiClientError, readBackendResponse } from "./backend";

describe("readBackendResponse", () => {
  it("unwraps a successful Nest response envelope", async () => {
    const response = Response.json({ status: 200, success: true, message: "Success", data: { online: 7 } });

    await expect(readBackendResponse<{ online: number }>(response)).resolves.toEqual({ online: 7 });
  });

  it("preserves the backend error code, request id, and retry delay", async () => {
    const response = Response.json(
      {
        code: "ADMIN_LOGIN_RATE_LIMITED",
        message_en: "Too many sign-in attempts. Try again later.",
        message_hi: "Try again later.",
        retryable: true,
        action: "WAIT",
        requestId: "request-1",
        retryAfterSeconds: 300,
      },
      { status: 429 },
    );

    const error = await readBackendResponse(response).catch((value) => value);

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ code: "ADMIN_LOGIN_RATE_LIMITED", requestId: "request-1", retryAfterSeconds: 300 });
  });
});
