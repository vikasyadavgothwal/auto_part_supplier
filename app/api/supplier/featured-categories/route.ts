import { NextRequest, NextResponse } from "next/server"

import { applySetCookieHeaders, getSetCookieHeaders, requestBackend } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

async function proxy(request: NextRequest, method: "GET" | "PUT") {
  const query = request.nextUrl.searchParams.toString()
  const backend = await requestBackend(`/api/v1/supplier/featured-categories${query ? `?${query}` : ""}`, {
    method,
    cookieHeader: request.headers.get("cookie"),
    body: method === "PUT" ? await request.text() : undefined,
    contentType: method === "PUT" ? "application/json" : undefined,
    userAgent: request.headers.get("user-agent"),
  })
  const response = new NextResponse(await backend.text(), {
    status: backend.status,
    headers: { "content-type": backend.headers.get("content-type") ?? "application/json" },
  })
  applySetCookieHeaders(response, getSetCookieHeaders(backend.headers))
  return response
}

export async function GET(request: NextRequest) {
  return proxy(request, "GET")
}

export async function PUT(request: NextRequest) {
  return proxy(request, "PUT")
}
