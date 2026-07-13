"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { FilterBar } from "@/components/shared/filter-bar"
import type { FilterOption } from "@/components/shared/types"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { authenticatedFetch } from "@/lib/auth/client"

import { offerTips } from "./data"
import { OffersTable } from "./offers-table"
import type {
  Offer,
  OfferFilter,
  OfferPagination,
  OfferSummary,
  OfferStatus,
  SupplierOfferRecord,
  SupplierOfferStatus,
} from "./types"

const offerFilters: readonly FilterOption<OfferFilter>[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Accepted", label: "Accepted" },
  { key: "Rejected", label: "Rejected" },
  { key: "Withdrawn", label: "Withdrawn" },
]

const backendStatusByFilter: Partial<Record<OfferFilter, SupplierOfferStatus>> = {
  Pending: "submitted",
  Accepted: "accepted",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
}

const statusLabel: Record<SupplierOfferStatus, OfferStatus> = {
  submitted: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

const money = (amount: number) =>
  `AED ${amount.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-AE") : "-"

const buyerName = (offer: SupplierOfferRecord) =>
  offer.buyerCompanyName || offer.buyerContactName || offer.buyerEmail || "Buyer"

const vehicleName = (offer: SupplierOfferRecord) =>
  [
    offer.vehicleYear,
    offer.vehicleMake,
    offer.vehicleModel,
    offer.vehicleTrim,
  ]
    .filter(Boolean)
    .join(" ") || "Not specified"

const mapOffer = (record: SupplierOfferRecord): Offer => ({
  id: `BID-${record.id.slice(-6).toUpperCase()}`,
  bidId: record.id,
  rfqId: record.rfqPublicId,
  buyer: buyerName(record),
  buyerEmail: record.buyerEmail,
  projectName: record.projectName,
  vehicle: vehicleName(record),
  part:
    record.parts.length === 1
      ? record.parts[0]?.partName ?? "Part"
      : `${record.parts.length} parts`,
  qty: String(record.parts.reduce((sum, part) => sum + part.quantity, 0)),
  price: money(record.totalAmount),
  amount: record.totalAmount,
  eta: `${record.deliveryDays} day${record.deliveryDays === 1 ? "" : "s"}`,
  status: statusLabel[record.status],
  submitted: formatDate(record.submittedAt),
  validUntil: formatDate(record.validUntil),
  notes: record.notes,
  rfqStatus: record.rfqStatus,
  orderId: record.order?.publicId ?? null,
  orderStatus: record.order?.status ?? null,
  deliveryRequirement: record.deliveryRequirement,
  paymentTerms: record.paymentTerms,
})

type OffersPayload = {
  ok: boolean
  offers?: SupplierOfferRecord[]
  pagination?: OfferPagination
  summary?: OfferSummary
  message?: string
}

export function OffersPageContent({
  initialOffers,
  initialPagination,
  initialSummary,
}: {
  initialOffers: SupplierOfferRecord[]
  initialPagination: OfferPagination
  initialSummary: OfferSummary
}) {
  const [offers, setOffers] = React.useState(() => initialOffers.map(mapOffer))
  const [pagination, setPagination] = React.useState(initialPagination)
  const [summary, setSummary] = React.useState(initialSummary)
  const [activeFilter, setActiveFilter] = React.useState<OfferFilter>("All")
  const [search, setSearch] = React.useState("")
  const [selectedOffer, setSelectedOffer] = React.useState<Offer | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const load = async (
    page: number,
    query = search,
    filter = activeFilter,
  ) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        search: query.trim(),
      })
      const backendStatus = backendStatusByFilter[filter]
      if (backendStatus) params.set("status", backendStatus)

      const response = await authenticatedFetch(`/api/supplier/offers?${params}`)
      const payload = (await response.json()) as OffersPayload
      if (
        !response.ok ||
        !payload.ok ||
        !payload.offers ||
        !payload.pagination ||
        !payload.summary
      ) {
        throw new Error(payload.message || "Unable to load offers")
      }

      setOffers(payload.offers.map(mapOffer))
      setPagination(payload.pagination)
      setSummary(payload.summary)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load offers")
    } finally {
      setLoading(false)
    }
  }

  const changeFilter = (filter: OfferFilter) => {
    setActiveFilter(filter)
    void load(1, search, filter)
  }

  const stats = [
    {
      label: "Total Offers",
      value: String(summary.totalOffers),
      valueClassName: "text-foreground",
    },
    {
      label: "Pending",
      value: String(summary.byStatus.submitted ?? 0),
      valueClassName: "text-brand-warning",
    },
    {
      label: "Accepted",
      value: String(summary.byStatus.accepted ?? 0),
      valueClassName: "text-primary",
    },
    {
      label: "Win Rate",
      value: summary.totalOffers
        ? `${Math.round(((summary.byStatus.accepted ?? 0) / summary.totalOffers) * 100)}%`
        : "0%",
      valueClassName: "text-foreground",
    },
  ]

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Offers
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Track submitted RFQ quotes, suggested prices, and quote results.
          </p>
        </div>

        <SummaryStatGrid stats={stats} />

        <div className="space-y-4">
          <FilterBar
            filters={offerFilters}
            activeFilter={activeFilter}
            onFilterChange={changeFilter}
          />

          <form
            className="flex max-w-2xl gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void load(1)
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search offer, RFQ, buyer, project, vehicle, or part..."
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Search
            </Button>
            {search ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("")
                  void load(1, "")
                }}
              >
                Clear
              </Button>
            ) : null}
          </form>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <OffersTable
          offers={offers}
          loading={loading}
          onSelectOffer={setSelectedOffer}
        />

        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            {offers.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
            -{Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
            of {pagination.total} offers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page <= 1}
              onClick={() => void load(pagination.page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => void load(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">
              Improve Your Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {offerTips.map((tip) => (
                <div key={tip.title}>
                  <div className="mb-2 font-semibold text-primary">
                    {tip.title}
                  </div>
                  <p className="text-sm text-brand-muted">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(selectedOffer)}
        onOpenChange={(open) => {
          if (!open) setSelectedOffer(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOffer?.id}</DialogTitle>
            <DialogDescription>
              {selectedOffer
                ? `${selectedOffer.rfqId} quote for ${selectedOffer.buyer}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer ? (
            <div className="space-y-5 text-sm">
              <div className="grid gap-3 rounded-lg border border-border bg-brand-panel p-4 sm:grid-cols-2">
                <p>
                  <span className="text-brand-muted">RFQ:</span>{" "}
                  {selectedOffer.rfqId}
                </p>
                <p>
                  <span className="text-brand-muted">Status:</span>{" "}
                  {selectedOffer.status}
                </p>
                <p>
                  <span className="text-brand-muted">Buyer:</span>{" "}
                  {selectedOffer.buyer}
                </p>
                <p>
                  <span className="text-brand-muted">Email:</span>{" "}
                  {selectedOffer.buyerEmail || "-"}
                </p>
                <p>
                  <span className="text-brand-muted">Project:</span>{" "}
                  {selectedOffer.projectName}
                </p>
                <p>
                  <span className="text-brand-muted">Vehicle:</span>{" "}
                  {selectedOffer.vehicle}
                </p>
                <p>
                  <span className="text-brand-muted">Suggested price:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {selectedOffer.price}
                  </span>
                </p>
                <p>
                  <span className="text-brand-muted">Delivery ETA:</span>{" "}
                  {selectedOffer.eta}
                </p>
                <p>
                  <span className="text-brand-muted">Valid until:</span>{" "}
                  {selectedOffer.validUntil}
                </p>
                <p>
                  <span className="text-brand-muted">Submitted:</span>{" "}
                  {selectedOffer.submitted}
                </p>
                <p>
                  <span className="text-brand-muted">Payment terms:</span>{" "}
                  {selectedOffer.paymentTerms}
                </p>
                <p>
                  <span className="text-brand-muted">Delivery requirement:</span>{" "}
                  {selectedOffer.deliveryRequirement}
                </p>
                {selectedOffer.orderId ? (
                  <p className="sm:col-span-2">
                    <span className="text-brand-muted">Won order:</span>{" "}
                    {selectedOffer.orderId} ({selectedOffer.orderStatus})
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Quote notes</h3>
                <p className="rounded-lg border border-border p-4 text-brand-muted">
                  {selectedOffer.notes || "No notes added."}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
