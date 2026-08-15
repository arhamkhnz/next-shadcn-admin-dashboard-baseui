export type ApiEnvelope<T> = {
  status: number;
  success: true;
  message: string;
  data: T;
};

export type ApiErrorBody = {
  code: string;
  message_en: string;
  message_hi?: string;
  retryable: boolean;
  action: string;
  requestId?: string;
  retryAfterSeconds?: number;
  details?: Record<string, unknown>;
};

export type AdminIdentity = {
  id: string;
  username: string;
  role: "ADMIN";
};

export type AdminTokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: AdminIdentity;
};

export type PublicAdminSession = Pick<AdminTokenPair, "accessExpiresAt"> & {
  user: AdminIdentity;
};
