import type { SummaryStat } from "@/components/summary-stat-grid"

export type OfferStat = SummaryStat

export type OfferStatus = "Pending" | "Accepted" | "Rejected"

export type Offer = {
  id: string
  rfqId: string
  buyer: string
  part: string
  qty: string
  price: string
  eta: string
  status: OfferStatus
  submitted: string
}

export type OfferTip = {
  title: string
  description: string
}
