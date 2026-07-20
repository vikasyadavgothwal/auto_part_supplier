import { Banknote, FileText, Package, ShoppingCart, TrendingUp, TriangleAlert } from "lucide-react"

import type { SupplierAnalytics } from "@/lib/supplier-analytics.server"
import { appRoutes } from "@/lib/routes"
import { DashboardStatCards } from "./dashboard-stat-cards"
import { IntegrationStatusCard } from "./integration-status-card"
import { QuickLinkGrid } from "./quick-link-grid"
import { RecentOrdersSection } from "./recent-orders-section"
import { RfqInboxSection } from "./rfq-inbox-section"
import { TrustScoreCard } from "./trust-score-card"
import type { DashboardRfq, DashboardStat, Integration, QuickLink, RecentOrder } from "./types"

const currency = (value: number) => `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const percentageChange = (current: number, previous: number) => previous ? ((current - previous) / previous) * 100 : current ? 100 : 0
const titleStatus = (status: string) => `${status.charAt(0).toUpperCase()}${status.slice(1)}` as RecentOrder["status"]

export function DashboardPageContent({ analytics, error }: { analytics: SupplierAnalytics | null; error: string | null }) {
  if (!analytics) return <div className="min-h-screen bg-background p-8 text-foreground"><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-4 rounded border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error || "Unable to load supplier overview"}</p></div>

  const monthChange = percentageChange(analytics.overview.monthlyRevenue, analytics.overview.previousMonthRevenue)
  const stats: DashboardStat[] = [
    { label: "Today's Revenue", value: currency(analytics.overview.todayRevenue), change: "From today's orders", icon: Banknote, neutral: true },
    { label: "Monthly Revenue", value: currency(analytics.overview.monthlyRevenue), change: `${monthChange >= 0 ? "↑" : "↓"} ${Math.abs(Math.round(monthChange))}% vs last month`, icon: TrendingUp },
    { label: "RFQ Conversion", value: `${Math.round(analytics.overview.rfqConversionRate)}%`, change: `${analytics.offerCounts.accepted ?? 0} accepted offers`, icon: FileText, neutral: true },
    { label: "Low Stock Alerts", value: String(analytics.overview.lowStockProducts), change: "Products with 5 or fewer units", icon: TriangleAlert, neutral: true },
  ]
  const links: QuickLink[] = [
    { label: "Pending RFQs", value: String(analytics.overview.pendingRfqs), icon: FileText, href: appRoutes.rfqInbox, highlight: analytics.overview.pendingRfqs > 0 },
    { label: "Products Listed", value: String(analytics.overview.productsListed), icon: Package, href: appRoutes.inventory },
    { label: "Active Orders", value: String(analytics.overview.activeOrders), icon: ShoppingCart, href: appRoutes.orders },
  ]
  const now = new Date(analytics.generatedAt).getTime()
  const rfqs: DashboardRfq[] = analytics.recentRfqs.map((rfq) => {
    const remaining = new Date(rfq.responseDeadline).getTime() - now
    const days = Math.max(0, Math.ceil(remaining / 86_400_000))
    return { id: rfq.publicId, vehicle: rfq.vehicle, part: rfq.part, qty: String(rfq.quantity), deadline: days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`, deadlineUrgent: remaining <= 2 * 86_400_000, status: rfq.quoted ? "Quoted" : remaining <= 2 * 86_400_000 ? "Expiring" : "New" }
  })
  const orders: RecentOrder[] = analytics.recentOrders.map((order) => ({ id: order.publicId, customer: order.customer, part: order.part, qty: String(order.quantity), amount: currency(order.totalAmount), status: titleStatus(order.status) }))
  const integrations: Integration[] = [
    { icon: Package, label: "Inventory", sub: `${analytics.overview.productsListed} products · ${analytics.overview.lowStockProducts} low stock`, status: "synced", time: "Live" },
    { icon: ShoppingCart, label: "Order Management", sub: `${analytics.overview.activeOrders} active orders`, status: "synced", time: "Live" },
    { icon: FileText, label: "Quote System", sub: `${analytics.overview.pendingRfqs} RFQs awaiting quote`, status: "synced", time: "Live" },
  ]
  const score = Math.max(0, Math.min(100, Math.round(analytics.performance.fulfillmentRate * 0.7 + (100 - analytics.performance.cancellationRate) * 0.3)))
  const responseTime = analytics.performance.averageQuoteResponseHours === null ? "N/A" : `${analytics.performance.averageQuoteResponseHours.toFixed(1)} hrs`

  return <div className="min-h-screen space-y-8 bg-[#0A0A0A] p-6 text-white"><div><h1 className="mb-1 text-3xl font-bold">Dashboard</h1><p className="text-[#9CA3AF]">Live supplier performance and operations.</p></div><DashboardStatCards stats={stats} /><QuickLinkGrid links={links} /><RfqInboxSection rfqs={rfqs} /><RecentOrdersSection orders={orders} /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><TrustScoreCard score={score} fulfillmentRate={analytics.performance.fulfillmentRate} cancellationRate={analytics.performance.cancellationRate} responseTime={responseTime} /><IntegrationStatusCard integrations={integrations} /></div></div>
}
