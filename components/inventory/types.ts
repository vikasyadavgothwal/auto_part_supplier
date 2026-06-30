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
  message?: string
}

export type SupplierPartCreateResponse = {
  ok: boolean
  part?: SupplierPartApiRecord
  message?: string
}

export type SupplierPartUpdateResponse = SupplierPartCreateResponse

export type BulkUnmappedRow = {
  rowNumber: number
  vendorSku: string
  oemNumber?: string
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

export type BulkUploadResponse = {
  ok: boolean
  mode?: "products" | "images"
  summary?: ProductBulkUploadSummary | ImageBulkUploadSummary
  message?: string
}

export type CreateSupplierPartPayload = {
  partUid?: string
  completePartUid?: string
  brand: string
  mpn: string
  oemNumber: string
  price: number
  stock: number
  currency?: "AED"
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
