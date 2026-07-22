"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { FilterBar } from "../shared/filter-bar"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { rfqFilters } from "./data"
import { RfqTable } from "./rfq-table"
import { authenticatedFetch } from "@/lib/auth/client"
import type { Rfq, RfqFilter, RfqPagination } from "./types"

type BackendRfq = {
  id: string
  publicId: string
  companyName: string
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleTrim: string | null
  vehicleVin: string | null
  responseDeadline: string
  createdAt: string
  projectName: string
  description: string | null
  deliveryRequirement: string
  paymentTerms: string
  parts: Rfq["parts"]
  bids: NonNullable<Rfq["myBid"]>[]
}

const mapBackendRfq = (rfq: BackendRfq, responseTime: number): Rfq => {
  const myBid = rfq.bids[0] ?? null
  const expiresIn = new Date(rfq.responseDeadline).getTime() - responseTime
  return {
    id: rfq.id,
    publicId: rfq.publicId,
    buyer: rfq.companyName,
    vehicle: new Set(rfq.parts.map((part) => part.vehicleVin).filter(Boolean)).size > 1 ? `${new Set(rfq.parts.map((part) => part.vehicleVin).filter(Boolean)).size} vehicles` : [rfq.vehicleYear, rfq.vehicleMake, rfq.vehicleModel, rfq.vehicleTrim].filter(Boolean).join(" ") || "Not specified",
    vehicleVin: rfq.vehicleVin,
    part: rfq.parts.length === 1 ? rfq.parts[0].partName : `${rfq.parts.length} parts`,
    quantity: String(rfq.parts.reduce((sum, part) => sum + part.quantity, 0)),
    deadline: new Date(rfq.responseDeadline).toLocaleDateString("en-AE"),
    responseDeadline: rfq.responseDeadline,
    status: myBid ? "Quoted" : expiresIn <= 2 * 24 * 60 * 60 * 1000 ? "Expiring" : "New",
    created: new Date(rfq.createdAt).toLocaleDateString("en-AE"),
    projectName: rfq.projectName,
    description: rfq.description,
    deliveryRequirement: rfq.deliveryRequirement,
    paymentTerms: rfq.paymentTerms,
    parts: rfq.parts,
    myBid,
  }
}

export function RfqInboxPageContent({ initialRfqs, initialPagination }: { initialRfqs: Rfq[]; initialPagination: RfqPagination }) {
  const [activeFilter, setActiveFilter] = React.useState<RfqFilter>("All")
  const [rfqs, setRfqs] = React.useState(initialRfqs)
  const [pagination, setPagination] = React.useState(initialPagination)
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const load = async (page: number, query = search) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10", search: query.trim() })
      const response = await authenticatedFetch(`/api/supplier/rfqs?${params}`)
      const payload = await response.json() as { ok: boolean; rfqs?: BackendRfq[]; pagination?: RfqPagination; message?: string }
      if (!response.ok || !payload.ok || !payload.rfqs || !payload.pagination) throw new Error(payload.message || "Unable to load RFQs")
      const responseTime = new Date(response.headers.get("date") ?? 0).getTime()
      setRfqs(payload.rfqs.map((rfq) => mapBackendRfq(rfq, responseTime)))
      setPagination(payload.pagination)
      setActiveFilter("All")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load RFQs")
    } finally {
      setLoading(false)
    }
  }

  const filteredRfqs = React.useMemo(() => {
    if (activeFilter === "All") return rfqs
    return rfqs.filter((rfq) => rfq.status === activeFilter)
  }, [activeFilter, rfqs])
  const rfqStats = [
    { label: "Open RFQs", value: String(rfqs.length), valueClassName: "text-foreground" },
    { label: "New", value: String(rfqs.filter((rfq) => rfq.status === "New").length), valueClassName: "text-brand-success" },
    { label: "Expiring", value: String(rfqs.filter((rfq) => rfq.status === "Expiring").length), valueClassName: "text-brand-warning" },
    { label: "Quoted", value: String(rfqs.filter((rfq) => rfq.status === "Quoted").length), valueClassName: "text-foreground" },
  ]

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

        <form className="flex max-w-2xl gap-2" onSubmit={(event) => { event.preventDefault(); void load(1) }}>
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search RFQ ID, buyer, project, vehicle, VIN, or part..." className="pl-9" /></div>
          <Button type="submit" disabled={loading}>Search</Button>
          {search ? <Button type="button" variant="outline" onClick={() => { setSearch(""); void load(1, "") }}>Clear</Button> : null}
        </form>

        {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

        <RfqTable
          rfqs={filteredRfqs}
          onBidSubmitted={(rfqId, bid) => {
            setRfqs((current) => current.map((rfq) => (
              rfq.id === rfqId ? { ...rfq, status: "Quoted", myBid: bid } : rfq
            )))
          }}
        />

        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Showing {rfqs.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} RFQs</p>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={loading || pagination.page <= 1} onClick={() => void load(pagination.page - 1)}>Previous</Button><span>Page {pagination.page} of {pagination.totalPages}</span><Button variant="outline" size="sm" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => void load(pagination.page + 1)}>Next</Button></div>
        </div>
      </div>
    </div>
  )
}
