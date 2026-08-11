import { NextResponse } from "next/server"
import {
  DEFAULT_PROXY_TIMEOUT_MS,
  fetchWithTimeout,
  getBackendBaseUrl as getBackendBaseUrlFromEnv,
  getSetCookieHeaders as getSetCookieHeadersShared,
  mergeCookieHeader as mergeCookieHeaderShared,
  streamBackendRequest,
  toBackendCookieHeader as toBackendCookieHeaderShared,
  toDashboardSetCookie as toDashboardSetCookieShared,
} from "@shared/backend-proxy"

const BACKEND_BASE_URL_ENV_NAMES = [
  "ADMIN_API_BASE_URL",
  "BACKEND_URL",
  "NEXT_PUBLIC_ADMIN_API_BASE_URL",
] as const

const BACKEND_ACCESS_COOKIE = process.env.USER_ACCESS_COOKIE_NAME ?? "user_access_token"
const BACKEND_REFRESH_COOKIE = process.env.USER_REFRESH_COOKIE_NAME ?? "user_refresh_token"
export const SUPPLIER_ACCESS_COOKIE = "supplier_access_token"
export const SUPPLIER_REFRESH_COOKIE = "supplier_refresh_token"
const COOKIE_MAP = {
  backendAccessCookie: BACKEND_ACCESS_COOKIE,
  backendRefreshCookie: BACKEND_REFRESH_COOKIE,
  dashboardAccessCookie: SUPPLIER_ACCESS_COOKIE,
  dashboardRefreshCookie: SUPPLIER_REFRESH_COOKIE,
}

export function getBackendUrl(path: string): URL {
  return new URL(path, getBackendBaseUrl())
}

export function getBackendBaseUrl(): string {
  return getBackendBaseUrlFromEnv({
    envNames: BACKEND_BASE_URL_ENV_NAMES,
    missingMessage: `Missing backend API URL. Set one of: ${BACKEND_BASE_URL_ENV_NAMES.join(", ")}.`,
  })
}

export function getSetCookieHeaders(headers: Headers): string[] {
  return getSetCookieHeadersShared(headers)
}

export function applySetCookieHeaders(
  response: NextResponse | Response,
  values: string[],
): void {
  for (const value of values) {
    response.headers.append("set-cookie", toDashboardSetCookieShared(value, COOKIE_MAP))
  }
}

export function mergeCookieHeader(
  currentHeader: string | null,
  setCookieValues: string[],
): string {
  return mergeCookieHeaderShared(currentHeader, setCookieValues, COOKIE_MAP)
}

export function toBackendCookieHeader(header: string | null): string {
  return toBackendCookieHeaderShared(header, COOKIE_MAP)
}

export async function requestBackend(
  path: string,
  options: {
    method?: string
    cookieHeader?: string | null
    body?: BodyInit | null
    contentType?: string | null
    userAgent?: string | null
    timeoutMs?: number
  } = {},
): Promise<Response> {
  const headers = new Headers({ accept: "application/json" })
  if (options.contentType) headers.set("content-type", options.contentType)
  if (options.userAgent) headers.set("user-agent", options.userAgent)
  if (options.cookieHeader) {
    headers.set(
      "cookie",
      toBackendCookieHeaderShared(options.cookieHeader, COOKIE_MAP),
    )
  }

  try {
    return await fetchWithTimeout(getBackendUrl(path), {
      method: options.method ?? "GET",
      cache: "no-store",
      headers,
      body: options.body,
      timeoutMs: options.timeoutMs ?? DEFAULT_PROXY_TIMEOUT_MS,
    })
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }
}

export async function forwardBackendRequest(
  request: Request,
  path: string,
  options: { timeoutMs?: number } = {},
) {
  const sourceUrl = new URL(request.url)
  const url = getBackendUrl(path)
  url.search = sourceUrl.search
  return streamBackendRequest({
    request,
    backendUrl: url,
    method: request.method.toUpperCase(),
    setCookieMap: COOKIE_MAP,
    includeSetCookie: false,
    timeoutMs: options.timeoutMs,
  })
}
