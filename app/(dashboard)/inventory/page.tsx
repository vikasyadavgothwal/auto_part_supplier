import { headers } from "next/headers"

import { InventoryPageContent } from "@/components/inventory/inventory-page-content"
import { mapSupplierPartToProduct } from "@/components/inventory/mappers"
import type { Product } from "@/components/inventory/types"
import { getSupplierPartsFromBackend } from "@/lib/supplier-parts-api"

export default async function InventoryPage() {
  const requestHeaders = await headers()
  const cookieHeader = requestHeaders.get("cookie")
  let products: Product[] = []
  let loadError: string | null = null

  try {
    const supplierParts = await getSupplierPartsFromBackend(cookieHeader)
    products = supplierParts.map(mapSupplierPartToProduct)
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load supplier parts"
  }

  return <InventoryPageContent initialProducts={products} loadError={loadError} />
}
