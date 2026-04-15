"use client"

import * as React from "react"
import { Funnel } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Total Orders", value: "4", valueClassName: "text-foreground" },
  { label: "Processing", value: "2", valueClassName: "text-brand-warning" },
  { label: "Shipped", value: "1", valueClassName: "text-brand-info" },
  { label: "Revenue", value: "$205.46", valueClassName: "text-primary" },
] as const

type OrderStatus = "Processing" | "Shipped" | "Completed"

type Order = {
  id: string
  date: string
  customer: string
  part: string
  qty: string
  amount: string
  shipping: string
  status: OrderStatus
}

const orders: Order[] = [
  {
    id: "ORD-401",
    date: "2024-01-22",
    customer: "John Doe",
    part: "Brake Pads",
    qty: "1 Set",
    amount: "$89.99",
    shipping: "Standard",
    status: "Processing",
  },
  {
    id: "ORD-402",
    date: "2024-01-21",
    customer: "Jane Smith",
    part: "Oil Filter",
    qty: "2",
    amount: "$49.98",
    shipping: "2-Day",
    status: "Shipped",
  },
  {
    id: "ORD-403",
    date: "2024-01-20",
    customer: "Mike Johnson",
    part: "Air Filter",
    qty: "1",
    amount: "$19.99",
    shipping: "Standard",
    status: "Completed",
  },
  {
    id: "ORD-404",
    date: "2024-01-22",
    customer: "Sarah Williams",
    part: "Spark Plugs",
    qty: "4",
    amount: "$45.50",
    shipping: "Overnight",
    status: "Processing",
  },
]

const filters = ["All Orders", "Processing", "Shipped", "Completed"] as const
type FilterKey = (typeof filters)[number]

function getStatusBadge(status: OrderStatus) {
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

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("All Orders")

  const filteredOrders = React.useMemo(() => {
    if (activeFilter === "All Orders") return orders
    return orders.filter((order) => order.status === activeFilter)
  }, [activeFilter])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Manage and fulfill customer orders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="surface-card rounded-lg shadow-none">
              <CardContent className="p-6">
                <div className="text-sm text-brand-muted">{stat.label}</div>
                <div className={`mt-2 text-3xl font-bold ${stat.valueClassName}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-brand-muted">
            <Funnel className="h-5 w-5" />
            <span className="font-medium">Filter:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter

              return (
                <Button
                  key={filter}
                  type="button"
                  variant="outline"
                  onClick={() => setActiveFilter(filter)}
                  className={[
                    "h-10 rounded-lg border px-4 font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground hover:bg-brand-primary-hover hover:text-primary-foreground"
                      : "border-border bg-brand-panel text-brand-muted hover:border-primary hover:bg-brand-panel hover:text-foreground",
                  ].join(" ")}
                >
                  {filter}
                </Button>
              )
            })}
          </div>
        </div>

        <Card className="surface-card overflow-hidden rounded-lg shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Order ID
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Date
                  </TableHead>
                  <TableHead className="min-w-[160px] px-6 py-4 text-brand-muted">
                    Customer
                  </TableHead>
                  <TableHead className="min-w-[180px] px-6 py-4 text-brand-muted">
                    Part
                  </TableHead>
                  <TableHead className="min-w-[90px] px-6 py-4 text-brand-muted">
                    Qty
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Amount
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Shipping
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[100px] px-6 py-4 text-brand-muted">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.map((order) => (
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
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Button className="h-9 rounded-lg bg-brand-panel-strong px-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground">
                        {order.status === "Processing" ? "Ship" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
