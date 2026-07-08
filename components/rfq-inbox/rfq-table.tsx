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

export function RfqTable({ rfqs, onBidSubmitted }: RfqTableProps) {
  const [selected, setSelected] = React.useState<Rfq | null>(null)
  const [totalAmount, setTotalAmount] = React.useState("")
  const [deliveryDays, setDeliveryDays] = React.useState("")
  const [validUntil, setValidUntil] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const openQuote = (rfq: Rfq) => {
    setSelected(rfq)
    setTotalAmount(rfq.myBid ? String(rfq.myBid.totalAmount) : "")
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
        body: JSON.stringify({ totalAmount, deliveryDays, validUntil: validUntil || null, notes }),
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quote {selected?.publicId}</DialogTitle>
          <DialogDescription>
            {selected?.projectName} for {selected?.buyer}. Your latest quote replaces your previous quote.
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
              <div className="mt-4 space-y-2">
                {selected.parts.map((part) => (
                  <div key={part.id} className="flex justify-between gap-4 border-t border-border pt-2">
                    <span>{part.partName}{part.partNumber ? ` (${part.partNumber})` : ""}</span>
                    <span className="shrink-0">Qty {part.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quote-total">Total quote (AED)</Label>
                <Input id="quote-total" type="number" min="0.01" step="0.01" required value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-days">Delivery days</Label>
                <Input id="delivery-days" type="number" min="1" step="1" required value={deliveryDays} onChange={(event) => setDeliveryDays(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="valid-until">Quote valid until (optional)</Label>
                <Input id="valid-until" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="quote-notes">Notes</Label>
                <textarea id="quote-notes" className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : selected.myBid ? "Update Quote" : "Submit Quote"}</Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
    </>
  )
}
