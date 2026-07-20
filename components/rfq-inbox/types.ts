import type { SummaryStat } from "@/components/summary-stat-grid"

export type RfqStat = SummaryStat

export type RfqStatus = "New" | "Expiring" | "Quoted"

export type RfqPart = {
  id: string
  partName: string
  partNumber: string | null
  quantity: number
  targetPrice: number | null
  notes: string | null
}

export type RfqBid = {
  id: string
  totalAmount: number
  deliveryDays: number
  partType: string
  validUntil: string | null
  notes: string | null
  status: "submitted" | "accepted" | "rejected" | "withdrawn"
  items: Array<{
    id: string
    rfqPartId: string
    unitPrice: number
    lineTotal: number
    partType: string
  }>
}

export type Rfq = {
  id: string
  publicId: string
  buyer: string
  vehicle: string
  part: string
  quantity: string
  deadline: string
  responseDeadline: string
  status: RfqStatus
  created: string
  projectName: string
  description: string | null
  deliveryRequirement: string
  paymentTerms: string
  parts: RfqPart[]
  myBid: RfqBid | null
}

export type RfqFilter = "All" | RfqStatus

export type RfqPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
