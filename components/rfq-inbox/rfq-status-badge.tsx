import { Badge } from "@/components/ui/badge"

import type { RfqStatus } from "./types"

export function RfqStatusBadge({ status }: { status: RfqStatus }) {
  switch (status) {
    case "New":
      return (
        <Badge className="border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10">
          New
        </Badge>
      )
    case "Expiring":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Expiring
        </Badge>
      )
    case "Quoted":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Quoted
        </Badge>
      )
  }
}
