import type { LucideIcon } from "lucide-react"

export type PerformanceMetric = {
  title: string
  value: string
  subtitle: string
  subtitleClassName: string
  icon: LucideIcon
}

export type TopSellingProduct = {
  rank: number
  name: string
  unitsSold: string
  revenue: string
}

export type CustomerFeedback = {
  name: string
  rating: number
  feedback: string
  time: string
}
