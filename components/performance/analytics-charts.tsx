import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SupplierAnalytics } from "@/lib/supplier-analytics.server"

export function RevenueTrendChart({ data }: { data: SupplierAnalytics["revenueTrend"] }) {
  const max = Math.max(1, ...data.map((item) => item.revenue))
  const visible = data.slice(-14)
  return <Card className="surface-card rounded-sm shadow-none"><CardHeader><CardTitle className="text-base">Revenue Trend (14 Days)</CardTitle></CardHeader><CardContent><div className="flex h-64 items-end gap-2 border-b border-border pb-2">{visible.map((item) => <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-brand-muted">{item.revenue ? Math.round(item.revenue) : ""}</span><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(item.revenue ? 8 : 2, (item.revenue / max) * 180)}px` }} title={`${item.date}: AED ${item.revenue.toFixed(2)}`} /><span className="text-[9px] text-brand-muted">{new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-AE", { day: "2-digit", month: "short" })}</span></div>)}</div></CardContent></Card>
}

export function OrderStatusChart({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts)
  const max = Math.max(1, ...entries.map(([, count]) => count))
  return <Card className="surface-card rounded-sm shadow-none"><CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader><CardContent className="space-y-4">{entries.length ? entries.map(([status, count]) => <div key={status}><div className="mb-1 flex justify-between text-sm"><span className="capitalize text-brand-muted">{status}</span><span className="font-semibold">{count}</span></div><div className="h-3 overflow-hidden rounded-full bg-brand-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} /></div></div>) : <p className="py-20 text-center text-brand-muted">No orders yet.</p>}</CardContent></Card>
}
