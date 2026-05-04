import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { OrderStatusBadge } from "./order-status-badge"
import type { Order } from "./types"

type OrdersTableProps = {
  orders: readonly Order[]
}

const tableHeaders = [
  { label: "Order ID", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "Date", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  {
    label: "Customer",
    className: "min-w-[160px] px-6 py-4 text-brand-muted",
  },
  { label: "Part", className: "min-w-[180px] px-6 py-4 text-brand-muted" },
  { label: "Qty", className: "min-w-[90px] px-6 py-4 text-brand-muted" },
  { label: "Amount", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  {
    label: "Shipping",
    className: "min-w-[120px] px-6 py-4 text-brand-muted",
  },
  { label: "Status", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  { label: "Action", className: "min-w-[100px] px-6 py-4 text-brand-muted" },
] as const

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Card className="surface-card w-full min-w-0 overflow-hidden rounded-sm shadow-none py-0">
      <div className="w-full max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
              {tableHeaders.map((header) => (
                <TableHead key={header.label} className={header.className}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">{order.id}</span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {order.date}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {order.customer}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {order.part}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {order.qty}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-semibold text-foreground">
                    {order.amount}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {order.shipping}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <Button className="h-9 rounded-sm bg-brand-panel-strong px-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground">
                    {order.status === "Processing" ? "Ship" : "View"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
