import { headers } from "next/headers"

import { InventoryPageContent } from "@/components/inventory/inventory-page-content"
import { mapSupplierPartToProduct } from "@/components/inventory/mappers"
import type { InventoryPagination, Product } from "@/components/inventory/types"
import { getSupplierPartsFromBackend } from "@/lib/supplier-parts-api"

export default async function InventoryPage() {
  const requestHeaders = await headers()
  const cookieHeader = requestHeaders.get("cookie")
  let products: Product[] = []
  let pagination: InventoryPagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 }
  let loadError: string | null = null

  try {
    const result = await getSupplierPartsFromBackend(cookieHeader)
    products = result.parts.map(mapSupplierPartToProduct)
    pagination = result.pagination
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load supplier parts"
  }

  return <InventoryPageContent initialProducts={products} initialPagination={pagination} loadError={loadError} />
}
