"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { authenticatedFetch } from "@/lib/auth/client"
import type { LiveOrder, OrderPagination, OrderSummary } from "./live-types"

const money = (amount: number) => `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`
const buyerName = (order: LiveOrder) => order.buyer.companyName || [order.buyer.firstName, order.buyer.lastName].filter(Boolean).join(" ") || order.buyer.email || "Customer"
const deliveryAddress = (order: LiveOrder) => [
  order.deliveryAddressLine1,
  order.deliveryAddressLine2,
  order.deliveryLandmark,
  order.deliveryCity,
  order.deliveryState,
  order.deliveryPostalCode,
  order.deliveryCountry,
].filter(Boolean).join(", ") || "Not provided"
const statusClass = (status: LiveOrder["status"]) => status === "delivered"
  ? "bg-emerald-500/10 text-emerald-500"
  : status === "shipped" ? "bg-blue-500/10 text-blue-500"
  : status === "cancelled" ? "bg-red-500/10 text-red-500"
  : "bg-amber-500/10 text-amber-500"

export function LiveOrdersPageContent({
  initialOrders,
  initialPagination,
  initialSummary,
}: {
  initialOrders: LiveOrder[]
  initialPagination: OrderPagination
  initialSummary: OrderSummary
}) {
  const [orders, setOrders] = React.useState(initialOrders)
  const [pagination, setPagination] = React.useState(initialPagination)
  const [summary, setSummary] = React.useState(initialSummary)
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<LiveOrder | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const load = async (page: number, query = search) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10", search: query.trim() })
      const response = await authenticatedFetch(`/api/supplier/orders?${params}`)
      const payload = await response.json() as { ok: boolean; orders?: LiveOrder[]; pagination?: OrderPagination; summary?: OrderSummary; message?: string }
      if (!response.ok || !payload.ok || !payload.orders || !payload.pagination || !payload.summary) throw new Error(payload.message || "Unable to load orders")
      setOrders(payload.orders)
      setPagination(payload.pagination)
      setSummary(payload.summary)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load orders")
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: "Total Orders", value: String(summary.totalOrders), valueClassName: "text-foreground" },
    { label: "Pending", value: String((summary.byStatus.pending ?? 0) + (summary.byStatus.confirmed ?? 0)), valueClassName: "text-brand-warning" },
    { label: "Shipped", value: String(summary.byStatus.shipped ?? 0), valueClassName: "text-brand-info" },
    { label: "Revenue", value: money(summary.totalAmount), valueClassName: "text-primary" },
  ]

  return <div className="min-h-screen min-w-0 bg-background text-foreground">
    <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-6 lg:p-8">
      <div><h1 className="text-3xl font-bold tracking-tight">Orders</h1><p className="mt-2 text-sm text-brand-muted">RFQ and direct customer orders assigned to your supplier account.</p></div>
      <SummaryStatGrid stats={stats} />
      <form className="flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); void load(1) }}>
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order ID, RFQ, customer, or part..." className="pl-9" /></div>
        <Button type="submit" disabled={loading}>Search</Button>
        {search ? <Button type="button" variant="outline" onClick={() => { setSearch(""); void load(1, "") }}>Clear</Button> : null}
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card className="surface-card w-full overflow-hidden rounded-sm py-0 shadow-none">
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-brand-surface text-brand-muted"><tr><th className="p-4 text-left">Order ID</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Order Type</th><th className="p-4 text-left">Parts</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Action</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id} className="border-t border-border hover:bg-brand-panel-strong"><td className="p-4 font-semibold text-primary">{order.publicId}</td><td className="p-4 text-brand-muted">{new Date(order.createdAt).toLocaleDateString("en-AE")}</td><td className="p-4">{buyerName(order)}</td><td className="p-4 capitalize">{order.source === "rfq" ? "RFQ order" : "Direct order"}</td><td className="p-4">{order.items[0]?.partName || "-"}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}</td><td className="p-4 font-semibold">{money(order.totalAmount)}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass(order.status)}`}>{order.status}</span></td><td className="p-4"><Button size="sm" variant="outline" onClick={() => setSelected(order)}>View</Button></td></tr>)}</tbody></table></div>
        {!orders.length && !loading ? <p className="p-8 text-center text-brand-muted">No orders found.</p> : null}
      </Card>
      <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between"><p>Showing {orders.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={loading || pagination.page <= 1} onClick={() => void load(pagination.page - 1)}>Previous</Button><span>Page {pagination.page} of {pagination.totalPages}</span><Button variant="outline" size="sm" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => void load(pagination.page + 1)}>Next</Button></div></div>
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{selected?.publicId}</DialogTitle><DialogDescription>{selected?.source === "rfq" ? `Created from ${selected.rfq?.publicId}` : "Direct customer order"}</DialogDescription></DialogHeader>{selected ? <div className="space-y-5"><div className="grid gap-2 rounded-lg border p-4 text-sm sm:grid-cols-2"><p><span className="text-brand-muted">Customer:</span> {buyerName(selected)}</p><p><span className="text-brand-muted">Email:</span> {selected.buyer.email || "-"}</p><p><span className="text-brand-muted">Account phone:</span> {selected.buyer.phone || "-"}</p><p><span className="text-brand-muted">Recipient:</span> {selected.deliveryRecipientName || buyerName(selected)}</p><p><span className="text-brand-muted">Delivery phone:</span> {selected.deliveryPhone || selected.buyer.phone || "-"}</p><p className="sm:col-span-2"><span className="text-brand-muted">Delivery address:</span> {deliveryAddress(selected)}</p><p><span className="text-brand-muted">Total:</span> {money(selected.totalAmount)}</p><p><span className="text-brand-muted">Status:</span> <span className="capitalize">{selected.status}</span></p>{selected.rfq ? <><p><span className="text-brand-muted">Delivery:</span> {selected.rfq.deliveryRequirement}</p><p><span className="text-brand-muted">Payment:</span> {selected.rfq.paymentTerms}</p><p className="sm:col-span-2"><span className="text-brand-muted">Vehicle:</span> {[selected.rfq.vehicleYear, selected.rfq.vehicleMake, selected.rfq.vehicleModel, selected.rfq.vehicleTrim].filter(Boolean).join(" ") || "-"}{selected.rfq.vehicleVin ? ` · VIN ${selected.rfq.vehicleVin}` : ""}</p></> : null}</div><div><h3 className="mb-2 font-semibold">Items</h3>{selected.items.map((item) => <div key={item.id} className="flex justify-between gap-4 border-t py-3 text-sm"><div><p>{item.partName}</p><p className="text-brand-muted">{item.partNumber || "No part number"}</p><p className="text-brand-muted">Unit price: {item.unitPrice === null ? "Included in quote" : money(item.unitPrice)}</p></div><div className="text-right"><p>Qty {item.quantity}</p><p className="font-semibold">{item.lineTotal === null ? "Included in quote" : money(item.lineTotal)}</p></div></div>)}</div></div> : null}</DialogContent></Dialog>
  </div>
}
