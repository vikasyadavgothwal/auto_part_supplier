import type { SummaryStat } from "../shared/summary-stat-grid"

export type RfqStat = SummaryStat

export type RfqStatus = "New" | "Expiring" | "Quoted"

export type Rfq = {
  id: string
  buyer: string
  vehicle: string
  part: string
  quantity: string
  deadline: string
  status: RfqStatus
  created: string
}

export type RfqFilter = "All" | RfqStatus
