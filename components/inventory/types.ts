import type { SummaryStat } from "@/components/summary-stat-grid"

export type InventoryStat = SummaryStat

export type MappingStatus = "Mapped" | "Unmapped"

export type SupplierMappingStatus =
  | "Uploaded"
  | "Processing"
  | "Mapped"
  | "Pending Review"
  | "Failed"

export type Product = {
  id?: string
  vendorSku: string | null
  partNumber: string
  productName: string
  brand: string
  oemNumber: string
  stock: number
  price: string
  priceValue: number
  currency: "AED"
  mapping: MappingStatus
  mappingStatus: SupplierMappingStatus
  vehicles: string
  category: string
  oemSupersessionNumbers: string[]
  competitorPartNumber: string | null
  competitorBrandName: string | null
  hsCode: string | null
  mappingError: string | null
  source: string | null
  imageUrls: string[]
  imageKeys: string[]
  badgeText: string | null
  heading: string | null
  description: string | null
  keyFeatures: string[]
  rawUploadData?: unknown
}

export type SupplierPartMappingStatusApi =
  | "uploaded"
  | "processing"
  | "mapped"
  | "pending_review"
  | "failed"

export type SupplierPartApiRecord = {
  id: string
  vendorSku: string | null
  originalPartName: string
  originalBrand: string | null
  originalMpn: string | null
  originalOemNumber: string | null
  price: number
  stock: number
  currency: string
  category: string | null
  oemSupersessionNumbers: string[]
  competitorPartNumber: string | null
  competitorBrandName: string | null
  hsCode: string | null
  supplierImageUrls: string[]
  mappingStatus: SupplierPartMappingStatusApi
  mappingError: string | null
  rawUploadData?: unknown
  createdAt: string
  updatedAt: string
  part?: {
    partUid: string
    partName: string | null
    partNumber: string | null
    brandName: string | null
    category: string | null
    source: string
    imageUrls: string[]
    imageKeys: string[]
    badgeText: string | null
    heading: string | null
    description: string | null
    keyFeatures: string[]
  } | null
}

export type SupplierPartsListResponse = {
  ok: boolean
  parts?: SupplierPartApiRecord[]
  pagination?: InventoryPagination
  message?: string
}

export type InventoryPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type SupplierPartCreateResponse = {
  ok: boolean
  part?: SupplierPartApiRecord
  message?: string
}

export type SupplierPartUpdateResponse = SupplierPartCreateResponse

export type UpdateSupplierPartPayload = {
  vendorSku: string
  productName: string
  shortDescription: string
  longDescription: string
  mpn: string
  status: string
  grade: string
  condition: string
  basePrice: number | string
  discountPrice: number | string
  currency: string
  taxClass: string
  vat: string
  maxRetailPrice: number | string
  wholesaleDistributorPrice: number | string
  fleetPrice: number | string
  price: number
  stock: number
  rawUploadData: unknown
}

export type BulkUnmappedRow = {
  rowNumber: number
  vendorSku: string
  brand?: string | null
  oemNumber?: string
  competitorPartNumber?: string | null
  competitorBrandName?: string | null
  reason: string
}

export type ProductBulkUploadSummary = {
  totalRows: number
  mappedCount: number
  localMappedCount: number
  vin17MappedCount: number
  unmappedCount: number
  mappedParts: SupplierPartApiRecord[]
  unmapped: BulkUnmappedRow[]
  unmatchedImageRows: BulkUnmappedRow[]
}

export type ImageBulkUploadSummary = {
  totalRows: number
  updatedCount: number
  unmatchedCount: number
  updatedParts: SupplierPartApiRecord[]
  unmatched: BulkUnmappedRow[]
}

export type StockBulkUpdateSummary = ImageBulkUploadSummary

export type PricingBulkUpdateSummary = ImageBulkUploadSummary

export type BulkUploadResponse = {
  ok: boolean
  mode?: "products" | "images" | "stock" | "pricing"
  summary?:
    | ProductBulkUploadSummary
    | ImageBulkUploadSummary
    | StockBulkUpdateSummary
    | PricingBulkUpdateSummary
  message?: string
}

export type CreateSupplierPartPayload = {
  partUid?: string
  completePartUid?: string
  vendorSku: string
  brand?: string
  partNumber?: string
  competitorPartNumber?: string
  competitorBrandName?: string
  price: number
  stock: number
  currency?: "AED"
  rawUploadData?: unknown
  product?: {
    partName: string
    category: string
    badgeText: string
    heading: string
    description: string
    keyFeatures: string[]
    imageUrls: string[]
    imageKeys: string[]
  }
}

export type SupplierPartLookupResult = {
  exists: boolean
  requiresProductDetails: boolean
  part: SupplierPartApiRecord["part"]
  supplierOffer: SupplierPartApiRecord | null
  vin17Suggestion: {
    partNumber: string | null
    partName: string | null
    brandName: string | null
    category: string | null
    imageUrl: string | null
  } | null
  message?: string
}
