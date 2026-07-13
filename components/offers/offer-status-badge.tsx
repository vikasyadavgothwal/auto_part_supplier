import { Badge } from "@/components/ui/badge"

import type { OfferStatus } from "./types"

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  switch (status) {
    case "Pending":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Pending
        </Badge>
      )
    case "Accepted":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Accepted
        </Badge>
      )
    case "Rejected":
      return (
        <Badge className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10">
          Rejected
        </Badge>
      )
    case "Withdrawn":
      return (
        <Badge className="border-brand-muted/20 bg-brand-muted/10 text-brand-muted hover:bg-brand-muted/10">
          Withdrawn
        </Badge>
      )
  }
}
