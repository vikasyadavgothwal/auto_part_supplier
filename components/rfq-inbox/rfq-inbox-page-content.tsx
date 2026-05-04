"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

import { FilterBar } from "../shared/filter-bar"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { rfqFilters, rfqs, rfqStats } from "./data"
import { RfqTable } from "./rfq-table"
import type { RfqFilter } from "./types"

export function RfqInboxPageContent() {
  const [activeFilter, setActiveFilter] = React.useState<RfqFilter>("All")

  const filteredRfqs = React.useMemo(() => {
    if (activeFilter === "All") return rfqs
    return rfqs.filter((rfq) => rfq.status === activeFilter)
  }, [activeFilter])

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              RFQ Inbox
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Review and respond to quote requests from buyers.
            </p>
          </div>

          <Button className="h-12 px-6 hover:bg-brand-primary-hover">
            Bulk Quote
          </Button>
        </div>

        <SummaryStatGrid stats={rfqStats} />

        <FilterBar
          filters={rfqFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <RfqTable rfqs={filteredRfqs} />
      </div>
    </div>
  )
}
