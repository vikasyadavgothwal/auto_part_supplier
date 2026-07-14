import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { OfferStatusBadge } from "./offer-status-badge"
import type { Offer } from "./types"

type OffersTableProps = {
  offers: readonly Offer[]
  loading?: boolean
  onSelectOffer: (offer: Offer) => void
}

const tableHeaders = [
  { label: "Offer ID", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "RFQ ID", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "Buyer", className: "min-w-[150px] px-6 py-4 text-brand-muted" },
  { label: "Part", className: "min-w-[220px] px-6 py-4 text-brand-muted" },
  { label: "Qty", className: "min-w-[90px] px-6 py-4 text-brand-muted" },
  { label: "Part Type", className: "min-w-[130px] px-6 py-4 text-brand-muted" },
  { label: "Price", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "ETA", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  { label: "Status", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  {
    label: "Submitted",
    className: "min-w-[130px] px-6 py-4 text-brand-muted",
  },
] as const

export function OffersTable({
  offers,
  loading = false,
  onSelectOffer,
}: OffersTableProps) {
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
            {offers.map((offer) => (
              <TableRow
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">{offer.id}</span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.rfqId}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.buyer}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.part}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.qty}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.partType}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-semibold text-foreground">
                    {offer.price}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.eta}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <OfferStatusBadge status={offer.status} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {offer.submitted}
                </TableCell>
              </TableRow>
            ))}
            {!offers.length ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className="px-6 py-10 text-center text-sm text-brand-muted"
                >
                  {loading ? "Loading offers..." : "No quote offers found."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
