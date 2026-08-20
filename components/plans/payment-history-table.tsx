"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type PaymentTransaction = {
  id: string
  type: string
  sourceKey?: string | null
  description: string
  amount: number
  currency: string
  status: string
  createdAt: string
  effectiveAt?: string | null
  validUntil?: string | null
  validityDays?: number | null
}

type PaymentHistoryTableProps = {
  accountLabel: string
  transactions: PaymentTransaction[]
  title?: string
  description?: string
  showExpiry?: boolean
  showDuration?: boolean
  hideTypeAndReference?: boolean
  showEffectiveDate?: boolean
}

const pageSize = 5
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
})

const formatDate = (value?: string | null) => {
  if (!value) return "Not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Not set" : dateFormatter.format(date)
}

const moneyText = (amount: number, currency = "AED") =>
  `${currency} ${(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const typeText = (type: string) => type === "add_on" ? "Add-on" : "Plan"
const durationText = (days?: number | null) => days ? `${days} day${days === 1 ? "" : "s"}` : "Not set"
const statusClass = (status: string) => status === "Scheduled"
  ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
  : status === "Cancelled"
    ? "border-muted-foreground/30 bg-muted text-muted-foreground"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"

export function PaymentHistoryTable({ accountLabel, transactions, title = "Plan & payment history", description, showExpiry = false, showDuration = false, hideTypeAndReference = false, showEffectiveDate = false }: PaymentHistoryTableProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize
  const visibleTransactions = useMemo(
    () => transactions.slice(start, start + pageSize),
    [start, transactions],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ?? `Upgrades, scheduled downgrades, applied plan changes, and add-on payments for this ${accountLabel} account.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{showEffectiveDate ? "Requested" : "Date"}</TableHead>
                  {showEffectiveDate ? <TableHead>Effective</TableHead> : null}
                  <TableHead>Description</TableHead>
                  {showDuration ? <TableHead>Duration</TableHead> : null}
                  {showExpiry ? <TableHead>Expiry</TableHead> : null}
                  {!hideTypeAndReference ? <TableHead>Type</TableHead> : null}
                  {!hideTypeAndReference ? <TableHead>Reference</TableHead> : null}
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTransactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    {showEffectiveDate ? <TableCell>{formatDate(item.effectiveAt ?? item.createdAt)}</TableCell> : null}
                    <TableCell className="font-medium whitespace-normal">{item.description}</TableCell>
                    {showDuration ? <TableCell>{durationText(item.validityDays)}</TableCell> : null}
                    {showExpiry ? <TableCell>{item.validUntil ? formatDate(item.validUntil) : "Not set"}</TableCell> : null}
                    {!hideTypeAndReference ? <TableCell>{typeText(item.type)}</TableCell> : null}
                    {!hideTypeAndReference ? <TableCell className="text-muted-foreground">{item.sourceKey ?? "—"}</TableCell> : null}
                    <TableCell className="text-right font-semibold">{item.type === "plan" && item.amount === 0 ? "—" : moneyText(item.amount, item.currency)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Showing {start + 1}-{Math.min(start + pageSize, transactions.length)} of {transactions.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </Button>
                <span>Page {safePage} of {pageCount}</span>
                <Button variant="outline" size="sm" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No plan or payment history yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
