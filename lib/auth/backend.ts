import { NextResponse } from "next/server"
const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "http://13.62.243.148:3000"
    : "http://localhost:3000";
const BACKEND_ACCESS_COOKIE = process.env.USER_ACCESS_COOKIE_NAME ?? "user_access_token"
const BACKEND_REFRESH_COOKIE = process.env.USER_REFRESH_COOKIE_NAME ?? "user_refresh_token"
export const SUPPLIER_ACCESS_COOKIE = "supplier_access_token"
export const SUPPLIER_REFRESH_COOKIE = "supplier_refresh_token"

const parseCookieHeader = (header: string | null) => {
  const cookies = new Map<string, string>()
  for (const segment of header?.split(";") ?? []) {
    const index = segment.indexOf("=")
    if (index > 0) {
      cookies.set(segment.slice(0, index).trim(), segment.slice(index + 1).trim())
    }
  }
  return cookies
}

export function toBackendCookieHeader(header: string | null) {
  const cookies = parseCookieHeader(header)
  const accessToken = cookies.get(SUPPLIER_ACCESS_COOKIE)
  const refreshToken = cookies.get(SUPPLIER_REFRESH_COOKIE)
  cookies.delete(BACKEND_ACCESS_COOKIE)
  cookies.delete(BACKEND_REFRESH_COOKIE)
  cookies.delete(SUPPLIER_ACCESS_COOKIE)
  cookies.delete(SUPPLIER_REFRESH_COOKIE)
  if (accessToken) cookies.set(BACKEND_ACCESS_COOKIE, accessToken)
  if (refreshToken) cookies.set(BACKEND_REFRESH_COOKIE, refreshToken)
  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ")
}

const dashboardCookieName = (name: string) => {
  if (name === BACKEND_ACCESS_COOKIE) return SUPPLIER_ACCESS_COOKIE
  if (name === BACKEND_REFRESH_COOKIE) return SUPPLIER_REFRESH_COOKIE
  return name
}

const toDashboardSetCookie = (value: string) => {
  const separator = value.indexOf("=")
  if (separator <= 0) return value
  return `${dashboardCookieName(value.slice(0, separator))}${value.slice(separator)}`
}

export function getBackendUrl(path: string): URL {
  const baseUrl =
    process.env.ADMIN_API_BASE_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL?.trim() ||
    DEFAULT_BACKEND_URL
  return new URL(path, baseUrl)
}

export function getSetCookieHeaders(headers: Headers): string[] {
  const enhancedHeaders = headers as Headers & {
    getSetCookie?: () => string[]
  }
  const values = enhancedHeaders.getSetCookie?.()
  if (values?.length) {
    return values
  }

  const combinedValue = headers.get("set-cookie")
  return combinedValue ? [combinedValue] : []
}

export function applySetCookieHeaders(
  response: NextResponse | Response,
  values: string[],
): void {
  for (const value of values) {
    response.headers.append("set-cookie", toDashboardSetCookie(value))
  }
}

export function mergeCookieHeader(
  currentHeader: string | null,
  setCookieValues: string[],
): string {
  const cookies = parseCookieHeader(currentHeader)

  for (const setCookie of setCookieValues) {
    const cookiePair = setCookie.split(";", 1)[0]
    const separatorIndex = cookiePair.indexOf("=")
    if (separatorIndex > 0) {
      cookies.set(
        dashboardCookieName(cookiePair.slice(0, separatorIndex).trim()),
        cookiePair.slice(separatorIndex + 1).trim(),
      )
    }
  }

  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ")
}

export async function requestBackend(
  path: string,
  options: {
    method?: string
    cookieHeader?: string | null
    body?: BodyInit | null
    contentType?: string | null
    userAgent?: string | null
  } = {},
): Promise<Response> {
  const headers = new Headers({ accept: "application/json" })
  if (options.cookieHeader) {
    headers.set("cookie", toBackendCookieHeader(options.cookieHeader))
  }
  if (options.contentType) headers.set("content-type", options.contentType)
  if (options.userAgent) headers.set("user-agent", options.userAgent)

  return fetch(getBackendUrl(path), {
    method: options.method ?? "GET",
    cache: "no-store",
    headers,
    body: options.body,
  })
}

export async function forwardBackendRequest(request: Request, path: string) {
  const sourceUrl = new URL(request.url)
  const url = getBackendUrl(path)
  url.search = sourceUrl.search
  const method = request.method.toUpperCase()
  const headers = new Headers({ accept: "application/json" })
  const cookie = request.headers.get("cookie")
  const contentType = request.headers.get("content-type")
  if (cookie) headers.set("cookie", toBackendCookieHeader(cookie))
  if (contentType) headers.set("content-type", contentType)
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
  })
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  })
}
