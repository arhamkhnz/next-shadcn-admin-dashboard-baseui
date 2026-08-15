const READ_PATHS = [
  /^operations\/(platform|support|safety)(\/|$)/,
  /^(users|companies|trips)(\/|$)/,
  /^drivers\/verification(\/|$)/,
];

const WRITE_PATHS = [
  /^operations\/(platform|support|safety)(\/|$)/,
  /^(users|companies|trips)(\/|$)/,
  /^drivers\/verification(\/|$)/,
];

export function isAllowedAdminProxyRequest(method: string, path: string): boolean {
  if (!path || path.includes("..") || path.includes("\\") || path.startsWith("/")) return false;
  const patterns = method === "GET" || method === "HEAD" ? READ_PATHS : WRITE_PATHS;
  return patterns.some((pattern) => pattern.test(path));
}

export function isSameOrigin(origin: string | null, expectedOrigin: string): boolean {
  return origin === expectedOrigin;
}
