import { NextResponse } from "next/server"

type CookieNameMap = {
  backendAccessCookie: string
  backendRefreshCookie: string
  dashboardAccessCookie: string
  dashboardRefreshCookie: string
}

const DEFAULT_PROXY_TIMEOUT_MS = 10_000

type TimeoutRequestInit = RequestInit & {
  timeoutMs?: number
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: TimeoutRequestInit = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_PROXY_TIMEOUT_MS, signal, ...requestInit } = init
  if (signal) {
    return fetch(input, { ...requestInit, signal })
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(new Error("Backend request timed out")),
    timeoutMs,
  )

  try {
    return await fetch(input, { ...requestInit, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const parseCookieHeader = (header: string | null) => {
  const cookies = new Map<string, string>()

  for (const segment of header?.split(";") ?? []) {
    const trimmed = segment.trim()
    const index = trimmed.indexOf("=")
    if (index > 0) {
      cookies.set(trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim())
    }
  }

  return cookies
}

const encodeCookies = (cookies: Map<string, string>) =>
  Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ")

const getBackendBaseUrlFromEnv = ({
  envNames,
  missingMessage,
}: {
  envNames: readonly string[]
  missingMessage: string
}) => {
  for (const name of envNames) {
    const value = process.env[name]?.trim()
    if (value) return value
  }

  throw new Error(missingMessage)
}

const getSetCookieHeadersShared = (headers: Headers): string[] => {
  const enhancedHeaders = headers as Headers & {
    getSetCookie?: () => string[]
  }
  const values = enhancedHeaders.getSetCookie?.()
  if (values?.length) return values

  const combinedValue = headers.get("set-cookie")
  return combinedValue ? [combinedValue] : []
}

const toBackendCookieHeaderShared = (
  header: string | null,
  cookieMap: CookieNameMap,
) => {
  if (!header) return ""

  const cookies = parseCookieHeader(header)
  const accessToken = cookies.get(cookieMap.dashboardAccessCookie)
  const refreshToken = cookies.get(cookieMap.dashboardRefreshCookie)

  cookies.delete(cookieMap.backendAccessCookie)
  cookies.delete(cookieMap.backendRefreshCookie)
  cookies.delete(cookieMap.dashboardAccessCookie)
  cookies.delete(cookieMap.dashboardRefreshCookie)

  if (accessToken) cookies.set(cookieMap.backendAccessCookie, accessToken)
  if (refreshToken) cookies.set(cookieMap.backendRefreshCookie, refreshToken)

  return encodeCookies(cookies)
}

const toDashboardSetCookieShared = (
  value: string,
  cookieMap: CookieNameMap,
) => {
  const semicolonIndex = value.indexOf(";")
  const pair = semicolonIndex === -1 ? value : value.slice(0, semicolonIndex)
  const index = pair.indexOf("=")
  if (index <= 0) return value

  const name = pair.slice(0, index).trim()
  const mappedName =
    name === cookieMap.backendAccessCookie
      ? cookieMap.dashboardAccessCookie
      : name === cookieMap.backendRefreshCookie
        ? cookieMap.dashboardRefreshCookie
        : name

  if (mappedName === name) return value

  const attributes = semicolonIndex === -1 ? "" : value.slice(semicolonIndex)
  return `${mappedName}${pair.slice(index)}${attributes}`
}

const mergeCookieHeaderShared = (
  currentHeader: string | null,
  setCookieValues: string[],
  cookieMap: CookieNameMap,
) => {
  const cookies = parseCookieHeader(currentHeader)

  for (const setCookie of setCookieValues) {
    const translatedCookie = toDashboardSetCookieShared(setCookie, cookieMap)
    const pair = translatedCookie.split(";", 1)[0]
    const index = pair.indexOf("=")
    if (index > 0) {
      cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
    }
  }

  return encodeCookies(cookies)
}

const streamBackendRequest = async ({
  request,
  backendUrl,
  method: requestedMethod,
  setCookieMap,
  timeoutMs,
}: {
  request: Request
  backendUrl: URL
  method?: string
  setCookieMap: CookieNameMap
  includeSetCookie?: boolean
  timeoutMs?: number
}) => {
  const method = (requestedMethod ?? request.method).toUpperCase()
  const headers = new Headers({ accept: "application/json" })
  const contentType = request.headers.get("content-type")
  const cookie = toBackendCookieHeaderShared(request.headers.get("cookie"), setCookieMap)
  const userAgent = request.headers.get("user-agent")
  const forwardedFor = request.headers.get("x-forwarded-for")

  if (contentType) headers.set("content-type", contentType)
  if (cookie) headers.set("cookie", cookie)
  if (userAgent) headers.set("user-agent", userAgent)
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor)

  let body: ArrayBuffer | undefined
  try {
    if (method !== "GET" && method !== "HEAD") {
      body = await request.arrayBuffer()
    }
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }

  try {
    const backendResponse = await fetchWithTimeout(backendUrl, {
      method,
      cache: "no-store",
      headers,
      body,
      timeoutMs,
    })

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "content-type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    })
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }
}

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
