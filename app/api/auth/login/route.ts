import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  mergeCookieHeader,
  requestBackend,
} from "@/lib/auth/backend"
import type { AuthApiPayload } from "@/lib/auth/types"

export const dynamic = "force-dynamic"

function authErrorResponse(message: string, status = 502) {
  return NextResponse.json(
    {
      ok: false,
      success: false,
      message,
    },
    { status },
  )
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  let backendResponse: Response
  try {
    backendResponse = await requestBackend("/api/v1/user/auth/login", {
      method: "POST",
      body,
      contentType: "application/json",
      userAgent: request.headers.get("user-agent"),
    })
  } catch (error) {
    console.error("Unable to reach authentication backend", error)
    return authErrorResponse("Unable to reach authentication server.")
  }

  let payload: AuthApiPayload
  try {
    payload = (await backendResponse.json()) as AuthApiPayload
  } catch (error) {
    console.error("Authentication backend returned a non-JSON response", error)
    return authErrorResponse("Authentication server returned an invalid response.")
  }

  const issuedCookies = getSetCookieHeaders(backendResponse.headers)

  if (
    backendResponse.ok &&
    payload.ok &&
    !payload.user.roles.includes("Supplier")
  ) {
    try {
      await requestBackend("/api/v1/user/auth/logout", {
        method: "POST",
        cookieHeader: mergeCookieHeader(null, issuedCookies),
        userAgent: request.headers.get("user-agent"),
      })
    } catch (error) {
      console.error("Unable to clear non-supplier backend session", error)
    }
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
