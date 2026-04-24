import type { SummaryStat } from "@/components/summary-stat-grid"

export type InventoryStat = SummaryStat

export type MappingStatus = "Mapped" | "Unmapped"

export type Product = {
  partNumber: string
  productName: string
  brand: string
  stock: number
  price: string
  mapping: MappingStatus
  vehicles: string
}
