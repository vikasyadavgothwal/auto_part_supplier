import type { OrderStatus, RfqStatus } from "./types"

export function RfqStatusBadge({ status }: { status: RfqStatus }) {
  if (status === "Expiring") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        Expiring
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-500 border-blue-500/20">
      New
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "Shipped") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
        Shipped
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
      Processing
    </span>
  )
}
