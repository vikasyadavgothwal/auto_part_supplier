import type { SummaryStat } from "../shared/summary-stat-grid"

export type OrderStat = SummaryStat

export type OrderStatus = "Processing" | "Shipped" | "Completed"

export type Order = {
  id: string
  date: string
  customer: string
  part: string
  qty: string
  amount: string
  shipping: string
  status: OrderStatus
}

export type OrderFilter = "All Orders" | OrderStatus
