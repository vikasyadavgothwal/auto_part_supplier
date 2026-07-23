import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  mergeCookieHeader,
  requestBackend,
} from "@/lib/auth/backend"
import type { AuthApiPayload } from "@/lib/auth/types"

export const dynamic = "force-dynamic"

async function readBackendJson(response: Response): Promise<AuthApiPayload | null> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().includes("application/json")) {
    return null
  }

  try {
    return (await response.json()) as AuthApiPayload
  } catch {
    return null
  }
}

const getFirebaseUidFromToken = (token: string): string | null => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { user_id?: unknown; sub?: unknown }
    const uid =
      typeof parsed.user_id === "string"
        ? parsed.user_id
        : typeof parsed.sub === "string"
          ? parsed.sub
          : ""

    return uid.trim() || null
  } catch {
    return null
  }
}

const withSupplierRoleRequest = (body: string): string => {
  try {
    const parsed = JSON.parse(body) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return body
    }

    const payload = parsed as Record<string, unknown>
    const firebaseIdToken =
      typeof payload.firebaseIdToken === "string"
        ? payload.firebaseIdToken
        : ""
    if (!firebaseIdToken) return body

    const requestedRoleUid =
      getFirebaseUidFromToken(firebaseIdToken) ||
      (typeof payload.requestedRoleUid === "string"
        ? payload.requestedRoleUid.trim()
        : "")
    if (!requestedRoleUid) return body

    return JSON.stringify({
      ...payload,
      requestedRole: "Supplier",
      requestedRoleUid,
    })
  } catch {
    return body
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = withSupplierRoleRequest(await request.text())
  const backendResponse = await requestBackend("/api/v1/user/auth/login", {
    method: "POST",
    body,
    contentType: "application/json",
    userAgent: request.headers.get("user-agent"),
  })
  const payload = await readBackendJson(backendResponse)
  const issuedCookies = getSetCookieHeaders(backendResponse.headers)

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        message:
          "Backend login endpoint did not return JSON. Check ADMIN_API_BASE_URL points to auto_parts_admin.",
      },
      { status: 502 },
    )
  }

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
