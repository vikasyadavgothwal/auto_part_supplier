import { forwardSupplierBackendRequest } from "@/lib/supplier-parts-api"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return forwardSupplierBackendRequest(
    request,
    `/api/supplier/parts/${encodeURIComponent(id)}`,
  )
}
