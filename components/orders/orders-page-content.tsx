"use client"

import * as React from "react"

import { FilterBar } from "../shared/filter-bar"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { orderFilters, orders, orderStats } from "./data"
import { OrdersTable } from "./orders-table"
import type { OrderFilter } from "./types"

export function OrdersPageContent() {
  const [activeFilter, setActiveFilter] =
    React.useState<OrderFilter>("All Orders")

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

        <SummaryStatGrid stats={orderStats} />

        <FilterBar
          filters={orderFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <OrdersTable orders={filteredOrders} />
      </div>
    </div>
  )
}
