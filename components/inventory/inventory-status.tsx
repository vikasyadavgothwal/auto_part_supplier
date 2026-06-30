import { Badge } from "@/components/ui/badge"

import type { MappingStatus, SupplierMappingStatus } from "./types"

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

export function SupplierMappingStatusBadge({
  status,
}: {
  status: SupplierMappingStatus
}) {
  switch (status) {
    case "Mapped":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Mapped
        </Badge>
      )
    case "Processing":
      return (
        <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
          Processing
        </Badge>
      )
    case "Pending Review":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Pending Review
        </Badge>
      )
    case "Failed":
      return (
        <Badge className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10">
          Failed
        </Badge>
      )
    case "Uploaded":
      return (
        <Badge className="border-border bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong">
          Uploaded
        </Badge>
      )
  }
}
