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

import { RfqStatusBadge } from "./rfq-status-badge"
import type { Rfq } from "./types"

type RfqTableProps = {
  rfqs: readonly Rfq[]
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

export function RfqTable({ rfqs }: RfqTableProps) {
  return (
    <Card className="surface-card overflow-hidden rounded-sm shadow-none py-0">
      <div className="overflow-x-auto">
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
                  <span className="font-medium text-primary">{rfq.id}</span>
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
                  {rfq.status === "Quoted" ? (
                    <Button
                      disabled
                      className="h-9 rounded-sm bg-brand-panel-strong px-4 text-sm text-brand-muted opacity-100 hover:bg-brand-panel-strong"
                    >
                      Quoted
                    </Button>
                  ) : (
                    <Button className="h-9 rounded-sm px-4 text-sm hover:bg-brand-primary-hover">
                      Quote
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
