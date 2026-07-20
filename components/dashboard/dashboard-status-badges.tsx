import type { OrderStatus, RfqStatus } from "./types"

export function RfqStatusBadge({ status }: { status: RfqStatus }) {
  if (status === "Quoted") {
    return <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">Quoted</span>
  }
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
  if (status === "Shipped" || status === "Delivered") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
        {status}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
      {status}
    </span>
  )
}
