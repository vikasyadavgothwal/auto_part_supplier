import { forwardSupplierPartsRequest } from "@/lib/supplier-parts-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return forwardSupplierPartsRequest(request)
}

export async function POST(request: Request) {
  return forwardSupplierPartsRequest(request)
}
