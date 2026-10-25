// Browser requests stay on the portfolio's origin so auth cookies remain first-party.
export const API = "/api/v1";

export function csrfToken() {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find(part => part.startsWith("portfolio_csrf="))?.split("=").slice(1).join("=") ?? "";
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (options.method && !["GET", "HEAD"].includes(options.method.toUpperCase())) headers.set("x-csrf-token", decodeURIComponent(csrfToken()));
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: "include", cache: "no-store" });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.error?.message ?? body.error?.code ?? message; } catch { /* response may be empty */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
