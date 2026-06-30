import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  requestBackend,
} from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  let backendCookies: string[] = []
  try {
    const backendResponse = await requestBackend("/api/v1/user/auth/logout", {
      method: "POST",
      cookieHeader: request.headers.get("cookie"),
      userAgent: request.headers.get("user-agent"),
    })
    backendCookies = getSetCookieHeaders(backendResponse.headers)
  } catch {
    // Local cookie clearing still completes logout if the backend is unavailable.
  }

  const response = NextResponse.json({
    ok: true,
    success: true,
    message: "Logged out successfully",
  })
  applySetCookieHeaders(response, backendCookies)

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  }
  response.cookies.set(
    process.env.USER_ACCESS_COOKIE_NAME ?? "user_access_token",
    "",
    cookieOptions,
  )
  response.cookies.set(
    process.env.USER_REFRESH_COOKIE_NAME ?? "user_refresh_token",
    "",
    cookieOptions,
  )

  return response
}
