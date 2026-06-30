import { NextResponse } from "next/server"

const DEFAULT_BACKEND_URL = "http://localhost:3000"

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
    response.headers.append("set-cookie", value)
  }
}

export function mergeCookieHeader(
  currentHeader: string | null,
  setCookieValues: string[],
): string {
  const cookies = new Map<string, string>()

  for (const segment of currentHeader?.split(";") ?? []) {
    const separatorIndex = segment.indexOf("=")
    if (separatorIndex > 0) {
      cookies.set(
        segment.slice(0, separatorIndex).trim(),
        segment.slice(separatorIndex + 1).trim(),
      )
    }
  }

  for (const setCookie of setCookieValues) {
    const cookiePair = setCookie.split(";", 1)[0]
    const separatorIndex = cookiePair.indexOf("=")
    if (separatorIndex > 0) {
      cookies.set(
        cookiePair.slice(0, separatorIndex).trim(),
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
  if (options.cookieHeader) headers.set("cookie", options.cookieHeader)
  if (options.contentType) headers.set("content-type", options.contentType)
  if (options.userAgent) headers.set("user-agent", options.userAgent)

  return fetch(getBackendUrl(path), {
    method: options.method ?? "GET",
    cache: "no-store",
    headers,
    body: options.body,
  })
}
