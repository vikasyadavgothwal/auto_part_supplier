"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { RfqStatusBadge } from "./rfq-status-badge"
import { authenticatedFetch } from "@/lib/auth/client"
import type { Rfq, RfqBid } from "./types"

type RfqTableProps = {
  rfqs: readonly Rfq[]
  onBidSubmitted: (rfqId: string, bid: RfqBid) => void
}

const tableHeaders = [
  { label: "RFQ ID", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "Buyer", className: "min-w-[140px] px-6 py-4 text-brand-muted" },
  { label: "Vehicle", className: "min-w-[180px] px-6 py-4 text-brand-muted" },
  { label: "Part", className: "min-w-[220px] px-6 py-4 text-brand-muted" },
  {
    label: "Quantity",
    className: "min-w-[100px] px-6 py-4 text-brand-muted",
  },
  {
    label: "Deadline",
    className: "min-w-[110px] px-6 py-4 text-brand-muted",
  },
  { label: "Status", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  { label: "Created", className: "min-w-[130px] px-6 py-4 text-brand-muted" },
  { label: "Action", className: "min-w-[100px] px-6 py-4 text-brand-muted" },
] as const

const partTypeOptions = ["New", "Used", "Refurbished", "Remanufactured", "Salvage"] as const

const money = (value: number) =>
  `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export function RfqTable({ rfqs, onBidSubmitted }: RfqTableProps) {
  const [selected, setSelected] = React.useState<Rfq | null>(null)
  const [itemQuotes, setItemQuotes] = React.useState<Record<string, { unitPrice: string; partType: (typeof partTypeOptions)[number] }>>({})
  const [deliveryDays, setDeliveryDays] = React.useState("")
  const [validUntil, setValidUntil] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const openQuote = (rfq: Rfq) => {
    setSelected(rfq)
    setItemQuotes(Object.fromEntries(rfq.parts.map((part) => {
      const existing = rfq.myBid?.items.find((item) => item.rfqPartId === part.id)
      return [part.id, {
        unitPrice: existing ? String(existing.unitPrice) : "",
        partType: partTypeOptions.find((option) => option === existing?.partType) ?? "New",
      }]
    })))
    setDeliveryDays(rfq.myBid ? String(rfq.myBid.deliveryDays) : "")
    setValidUntil(rfq.myBid?.validUntil?.slice(0, 10) ?? "")
    setNotes(rfq.myBid?.notes ?? "")
    setError("")
  }

  const submitQuote = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setError("")
    try {
      const response = await authenticatedFetch(`/api/supplier/rfqs/${selected.id}/bids`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryDays,
          items: selected.parts.map((part) => ({
            rfqPartId: part.id,
            unitPrice: itemQuotes[part.id]?.unitPrice,
            partType: itemQuotes[part.id]?.partType,
          })),
          validUntil: validUntil || null,
          notes,
        }),
      })
      const payload = await response.json() as { ok: boolean; bid?: RfqBid; message?: string }
      if (!response.ok || !payload.ok || !payload.bid) throw new Error(payload.message || "Unable to submit quote")
      onBidSubmitted(selected.id, payload.bid)
      setSelected(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit quote")
    } finally {
      setSubmitting(false)
    }
  }

  const quoteTotal = selected?.parts.reduce((sum, part) => {
    const unitPrice = Number(itemQuotes[part.id]?.unitPrice)
    return sum + (Number.isFinite(unitPrice) ? unitPrice * part.quantity : 0)
  }, 0) ?? 0

  return (
    <>
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
            {rfqs.map((rfq) => (
              <TableRow
                key={rfq.id}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">{rfq.publicId}</span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {rfq.buyer}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {rfq.vehicle}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {rfq.part}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {rfq.quantity}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span
                    className={
                      rfq.deadline === "1 day"
                        ? "font-semibold text-brand-warning"
                        : "text-brand-muted"
                    }
                  >
                    {rfq.deadline}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <RfqStatusBadge status={rfq.status} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {rfq.created}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <Button
                    className="h-9 rounded-sm px-4 text-sm hover:bg-brand-primary-hover"
                    onClick={() => openQuote(rfq)}
                  >
                    {rfq.myBid ? "Update Quote" : "Quote"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] sm:p-6 xl:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Quote {selected?.publicId}</DialogTitle>
          <DialogDescription>
            {selected?.projectName} for {selected?.buyer}. Enter an AED unit price
            for every requested part. Your latest submission replaces your previous quote.
          </DialogDescription>
        </DialogHeader>
        {selected ? (
          <form className="space-y-5" onSubmit={submitQuote}>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p><span className="text-muted-foreground">Vehicle:</span> {selected.vehicle}</p>
                <p><span className="text-muted-foreground">Deadline:</span> {selected.deadline}</p>
                <p><span className="text-muted-foreground">Delivery:</span> {selected.deliveryRequirement}</p>
                <p><span className="text-muted-foreground">Payment:</span> {selected.paymentTerms}</p>
              </div>
              {selected.description ? (
                <p className="mt-3 border-t border-border pt-3">
                  <span className="text-muted-foreground">Request details:</span>{" "}
                  {selected.description}
                </p>
              ) : null}
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label className="text-base">Quote every requested part</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete all {selected.parts.length} AED unit-price fields below.
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-muted-foreground">Calculated quote total</p>
                  <strong className="text-lg text-primary">{money(quoteTotal)}</strong>
                </div>
              </div>
              {selected.parts.map((part) => (
                <div key={part.id} className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(220px,1fr)_180px_190px_170px]">
                  <div>
                    <p className="font-medium">{part.partName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Part number: {part.partNumber || "Not provided"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quantity: {part.quantity}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Buyer target: {part.targetPrice === null ? "Not provided" : money(part.targetPrice)}
                    </p>
                    {part.notes ? <p className="mt-1 text-xs text-muted-foreground">Notes: {part.notes}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unit-price-${part.id}`}>Your unit price (AED)</Label>
                    <Input id={`unit-price-${part.id}`} type="number" inputMode="decimal" min="0.01" step="0.01" required placeholder="Enter AED price" value={itemQuotes[part.id]?.unitPrice ?? ""} onChange={(event) => setItemQuotes((current) => ({ ...current, [part.id]: { unitPrice: event.target.value, partType: current[part.id]?.partType ?? "New" } }))} className="border-primary/50 bg-background font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`part-type-${part.id}`}>Condition</Label>
                    <select id={`part-type-${part.id}`} required value={itemQuotes[part.id]?.partType ?? "New"} onChange={(event) => setItemQuotes((current) => ({ ...current, [part.id]: { unitPrice: current[part.id]?.unitPrice ?? "", partType: event.target.value as (typeof partTypeOptions)[number] } }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                      {partTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Line total (AED)</p>
                    <p className="mt-2 font-semibold">{money((Number(itemQuotes[part.id]?.unitPrice) || 0) * part.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-days">Delivery days</Label>
                <Input id="delivery-days" type="number" min="1" step="1" required value={deliveryDays} onChange={(event) => setDeliveryDays(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="valid-until">Quote valid until (optional)</Label>
                <Input id="valid-until" type="date" min={new Date().toISOString().slice(0, 10)} max={selected.responseDeadline.slice(0, 10)} value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Leave blank if the quote remains valid until the RFQ deadline ({selected.deadline}).
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="quote-notes">Notes</Label>
                <textarea id="quote-notes" className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter className="sticky bottom-0 -mx-4 -mb-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting || selected.parts.some((part) => !itemQuotes[part.id]?.unitPrice)}>{submitting ? "Submitting..." : selected.myBid ? "Update Complete Quote" : "Submit Complete Quote"}</Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
    </>
  )
}
