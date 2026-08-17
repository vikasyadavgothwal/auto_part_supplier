import { forwardSupplierBackendRequest } from "@/lib/supplier-parts-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return forwardSupplierBackendRequest(request, "/api/v1/supplier/parts/product-master-lookups")
}
