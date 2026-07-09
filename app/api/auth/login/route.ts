import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  mergeCookieHeader,
  requestBackend,
} from "@/lib/auth/backend"
import type { AuthApiPayload } from "@/lib/auth/types"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const backendResponse = await requestBackend("/api/v1/user/auth/login", {
    method: "POST",
    body,
    contentType: "application/json",
    userAgent: request.headers.get("user-agent"),
  })
  const payload = (await backendResponse.json()) as AuthApiPayload
  const issuedCookies = getSetCookieHeaders(backendResponse.headers)

  if (
    backendResponse.ok &&
    payload.ok &&
    !payload.user.roles.includes("Supplier")
  ) {
    await requestBackend("/api/v1/user/auth/logout", {
      method: "POST",
      cookieHeader: mergeCookieHeader(null, issuedCookies),
      userAgent: request.headers.get("user-agent"),
    })
    return NextResponse.json(
      {
        ok: false,
        success: false,
        message: "This account does not have supplier access.",
      },
      { status: 403 },
    )
  }

  const response = NextResponse.json(payload, {
    status: backendResponse.status,
  })
  if (backendResponse.ok) {
    applySetCookieHeaders(response, issuedCookies)
  }
  return response
}
