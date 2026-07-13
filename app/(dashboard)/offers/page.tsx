import { cookies } from "next/headers"

import { OffersPageContent } from "@/components/offers/offers-page-content"
import type {
  OfferPagination,
  OfferSummary,
  SupplierOfferRecord,
} from "@/components/offers/types"
import { requestBackend } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export default async function OffersPage() {
  let offers: SupplierOfferRecord[] = []
  let pagination: OfferPagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  }
  let summary: OfferSummary = {
    totalOffers: 0,
    totalAmount: 0,
    byStatus: {},
  }

  try {
    const response = await requestBackend("/api/v1/supplier/offers?page=1&pageSize=10", {
      cookieHeader: (await cookies()).toString(),
    })
    const payload = (await response.json()) as {
      ok: boolean
      offers?: SupplierOfferRecord[]
      pagination?: OfferPagination
      summary?: OfferSummary
    }
    if (response.ok && payload.ok) {
      offers = payload.offers ?? []
      pagination = payload.pagination ?? pagination
      summary = payload.summary ?? summary
    }
  } catch {}

  return (
    <OffersPageContent
      initialOffers={offers}
      initialPagination={pagination}
      initialSummary={summary}
    />
  )
}
