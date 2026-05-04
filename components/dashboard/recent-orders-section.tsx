import Link from "next/link"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { appRoutes } from "@/lib/routes"

import { OrderStatusBadge } from "./dashboard-status-badges"
import type { RecentOrder } from "./types"

type RecentOrdersSectionProps = {
  orders: readonly RecentOrder[]
}

const headers = [
  "Order ID",
  "Customer",
  "Part",
  "Quantity",
  "Amount",
  "Status",
] as const

export function RecentOrdersSection({ orders }: RecentOrdersSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        <Link
          href={appRoutes.orders}
          className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="text-[#9CA3AF] font-semibold"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-[#2A2A2A] hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                >
                  <TableCell className="text-[#9CA3AF]">{order.id}</TableCell>
                  <TableCell className="text-[#9CA3AF]">
                    {order.customer}
                  </TableCell>
                  <TableCell className="text-[#9CA3AF]">{order.part}</TableCell>
                  <TableCell className="text-[#9CA3AF]">{order.qty}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-white">
                      {order.amount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
