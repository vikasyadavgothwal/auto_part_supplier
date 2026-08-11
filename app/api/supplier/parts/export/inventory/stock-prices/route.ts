import { NextRequest, NextResponse } from "next/server"

import { requestBackend } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const backend = await requestBackend(
    "/api/v1/supplier/parts/export/inventory/stock-prices",
    {
      method: "GET",
      cookieHeader: request.headers.get("cookie"),
      userAgent: request.headers.get("user-agent"),
    },
  )

  const response = new NextResponse(backend.body, {
    status: backend.status,
    headers: {
      "content-type":
        backend.headers.get("content-type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition":
        backend.headers.get("content-disposition") ??
        `attachment; filename="supplier-inventory-stock-prices-export"`,
      "cache-control": "no-store",
      "x-export-format": backend.headers.get("x-export-format") ?? "unknown",
    },
  })

  return response
}
