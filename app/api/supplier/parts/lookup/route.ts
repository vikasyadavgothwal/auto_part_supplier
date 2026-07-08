import { forwardSupplierBackendRequest } from "@/lib/supplier-parts-api"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  return forwardSupplierBackendRequest(request, "/api/supplier/parts/lookup")
}
