import { cookies } from "next/headers"

import { requestBackend } from "@/lib/auth/backend"

export type SupplierReview = {
  id: string
  supplierId: string
  supplierName: string
  customerId: string
  customerName: string
  supplierPartId: string
  partUid: string
  orderItemId: string
  orderPublicId: string
  orderSource: string
  partName: string
  partNumber: string | null
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export type SupplierReviewPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type SupplierReviewsData = {
  reviews: SupplierReview[]
  pagination: SupplierReviewPagination
}

const fallbackPagination: SupplierReviewPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
}

export async function getSupplierReviews(page = 1): Promise<SupplierReviewsData> {
  const params = new URLSearchParams({
    page: String(Math.max(1, Math.floor(page))),
    pageSize: "10",
  })
  const response = await requestBackend(`/api/v1/supplier/reviews?${params}`, {
    cookieHeader: (await cookies()).toString(),
  })
  const payload = (await response.json().catch(() => null)) as
    | {
        ok: boolean
        reviews?: SupplierReview[]
        pagination?: SupplierReviewPagination
        message?: string
      }
    | null
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? "Unable to load supplier reviews")
  }
  return {
    reviews: payload.reviews ?? [],
    pagination: payload.pagination ?? fallbackPagination,
  }
}
