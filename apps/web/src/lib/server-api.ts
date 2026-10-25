const configuredApiOrigin =
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api/v1";
const normalizedApiOrigin = configuredApiOrigin.replace(/\/$/, "");

export const SERVER_API = normalizedApiOrigin.endsWith("/api/v1")
  ? normalizedApiOrigin
  : `${normalizedApiOrigin}/api/v1`;
