import { forwardSupplierBackendRequest } from "@/lib/supplier-parts-api"

export const dynamic = "force-dynamic"
const BULK_UPLOAD_PROXY_TIMEOUT_MS = 300_000

export async function POST(request: Request) {
  return forwardSupplierBackendRequest(
    request,
    "/api/v1/supplier/parts/bulk-upload",
    { timeoutMs: BULK_UPLOAD_PROXY_TIMEOUT_MS },
  )
}
