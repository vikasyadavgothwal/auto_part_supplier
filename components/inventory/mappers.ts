import type {
  InventoryStat,
  Product,
  SupplierMappingStatus,
  SupplierPartApiRecord,
  SupplierPartMappingStatusApi,
} from "./types"

const statusLabels: Record<SupplierPartMappingStatusApi, SupplierMappingStatus> =
  {
    uploaded: "Uploaded",
    processing: "Processing",
    mapped: "Mapped",
    pending_review: "Pending Review",
    failed: "Failed",
  }

export function mapSupplierPartToProduct(part: SupplierPartApiRecord): Product {
  const partNumber =
    part.originalMpn ??
    part.originalOemNumber ??
    part.part?.partNumber ??
    part.id.slice(0, 8)
  const mappingStatus = statusLabels[part.mappingStatus] ?? "Pending Review"

  return {
    id: part.id,
    vendorSku: part.vendorSku,
    partNumber,
    productName: part.part?.partName ?? part.originalPartName,
    brand: part.part?.brandName ?? part.originalBrand ?? "Unbranded",
    oemNumber:
      part.part?.partNumber ?? part.originalOemNumber ?? "Not provided",
    stock: part.stock,
    price: `${part.currency} ${part.price.toFixed(2)}`,
    priceValue: part.price,
    currency: "AED",
    mapping: part.mappingStatus === "mapped" ? "Mapped" : "Unmapped",
    mappingStatus,
    vehicles: part.mappingStatus === "mapped" ? "Mapped" : "Pending",
    category: part.part?.category ?? part.category ?? "Not provided",
    oemSupersessionNumbers: part.oemSupersessionNumbers ?? [],
    competitorPartNumber: part.competitorPartNumber ?? null,
    competitorBrandName: part.competitorBrandName ?? null,
    hsCode: part.hsCode ?? null,
    mappingError: part.mappingError,
    source: part.part?.source ?? null,
    imageUrls:
      part.supplierImageUrls?.length > 0
        ? part.supplierImageUrls
        : (part.part?.imageUrls ?? []),
    imageKeys: part.part?.imageKeys ?? [],
    badgeText: part.part?.badgeText ?? null,
    heading: part.part?.heading ?? null,
    description: part.part?.description ?? null,
    keyFeatures: part.part?.keyFeatures ?? [],
  }
}

export function buildInventoryStats(products: readonly Product[]): InventoryStat[] {
  const totalProducts = products.length
  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 12,
  ).length
  const outOfStock = products.filter((product) => product.stock === 0).length
  const unmapped = products.filter((product) => product.mapping !== "Mapped").length

  return [
    {
      label: "Total Products",
      value: String(totalProducts),
      valueClassName: "text-foreground",
    },
    {
      label: "Low Stock",
      value: String(lowStock),
      valueClassName: "text-brand-warning",
    },
    {
      label: "Out of Stock",
      value: String(outOfStock),
      valueClassName: "text-destructive",
    },
    {
      label: "Unmapped",
      value: String(unmapped),
      valueClassName: "text-foreground",
    },
  ]
}
