import { Badge } from "@/components/ui/badge"

import type { MappingStatus } from "./types"

export function MappingBadge({ mapping }: { mapping: MappingStatus }) {
  switch (mapping) {
    case "Mapped":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Mapped
        </Badge>
      )
    case "Unmapped":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Unmapped
        </Badge>
      )
  }
}

export function getStockClassName(stock: number) {
  if (stock === 0) return "text-destructive"
  if (stock <= 12) return "text-brand-warning"
  return "text-foreground"
}
