import type { SummaryStat } from "@/components/summary-stat-grid"

export type OfferStat = SummaryStat

export type OfferStatus = "Pending" | "Accepted" | "Rejected" | "Withdrawn"
export type OfferFilter = "All" | OfferStatus

export type Offer = {
  id: string
  bidId: string
  rfqId: string
  buyer: string
  buyerEmail: string
  projectName: string
  vehicle: string
  part: string
  qty: string
  price: string
  amount: number
  eta: string
  status: OfferStatus
  submitted: string
  validUntil: string
  notes: string | null
  rfqStatus: string
  orderId: string | null
  orderStatus: string | null
  deliveryRequirement: string
  paymentTerms: string
}

export type OfferTip = {
  title: string
  description: string
}

export type SupplierOfferStatus = "submitted" | "accepted" | "rejected" | "withdrawn"

export type SupplierOfferPart = {
  id: string
  partName: string
  partNumber: string | null
  quantity: number
  targetPrice: number | null
  notes: string | null
}

export type SupplierOfferRecord = {
  id: string
  rfqId: string
  rfqPublicId: string
  rfqStatus: string
  source: string
  buyerCompanyName: string
  buyerContactName: string
  buyerEmail: string
  projectName: string
  description: string | null
  vehicleVin: string | null
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleTrim: string | null
  responseDeadline: string
  deliveryRequirement: string
  paymentTerms: string
  parts: SupplierOfferPart[]
  totalAmount: number
  deliveryDays: number
  validUntil: string | null
  notes: string | null
  status: SupplierOfferStatus
  submittedAt: string
  updatedAt: string
  order: {
    id: string
    publicId: string
    status: string
    totalAmount: number
    createdAt: string
  } | null
}

export type OfferPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type OfferSummary = {
  totalOffers: number
  totalAmount: number
  byStatus: Partial<Record<SupplierOfferStatus, number>>
}
