import { Badge } from "@/components/ui/badge"

import type { OrderStatus } from "./types"

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "Processing":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Processing
        </Badge>
      )
    case "Shipped":
      return (
        <Badge className="border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10">
          Shipped
        </Badge>
      )
    case "Completed":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Completed
        </Badge>
      )
  }
}
