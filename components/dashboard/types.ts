import type { LucideIcon } from "lucide-react"

export type DashboardStat = {
  label: string
  value: string
  change: string
  icon: LucideIcon
  neutral?: boolean
}

export type QuickLink = {
  label: string
  value: string
  icon: LucideIcon
  href: string
  highlight?: boolean
}

export type RfqStatus = "New" | "Expiring"

export type DashboardRfq = {
  id: string
  vehicle: string
  part: string
  qty: string
  deadline: string
  deadlineUrgent: boolean
  status: RfqStatus
}

export type OrderStatus = "Processing" | "Shipped"

export type RecentOrder = {
  id: string
  customer: string
  part: string
  qty: string
  amount: string
  status: OrderStatus
}

export type IntegrationStatus = "synced" | "syncing"

export type Integration = {
  icon: LucideIcon
  label: string
  sub: string
  status: IntegrationStatus
  time: string
}
