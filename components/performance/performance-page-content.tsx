import { Banknote, Clock3, Package, TrendingUp, Users } from "lucide-react"

import type { SupplierAnalytics } from "@/lib/supplier-analytics.server"
import { OrderStatusChart, RevenueTrendChart } from "./analytics-charts"
import { PerformanceMetricGrid } from "./performance-metric-grid"
import { TopSellingProductsCard } from "./top-selling-products-card"
import type { PerformanceMetric, TopSellingProduct } from "./types"

const currency = (value: number) => `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const change = (current: number, previous: number) => previous ? ((current - previous) / previous) * 100 : current ? 100 : 0

export function PerformancePageContent({ analytics, error }: { analytics: SupplierAnalytics | null; error: string | null }) {
  if (!analytics) return <div className="min-h-screen bg-background p-8 text-foreground"><h1 className="text-3xl font-bold">Performance Analytics</h1><p className="mt-4 rounded border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error || "Unable to load supplier performance"}</p></div>

  const revenueChange = change(analytics.overview.monthlyRevenue, analytics.overview.previousMonthRevenue)
  const metrics: PerformanceMetric[] = [
    { title: "Monthly Revenue", value: currency(analytics.overview.monthlyRevenue), subtitle: `${revenueChange >= 0 ? "Up" : "Down"} ${Math.abs(Math.round(revenueChange))}% vs last month`, subtitleClassName: revenueChange >= 0 ? "text-primary" : "text-destructive", icon: Banknote },
    { title: "Average Order Value", value: currency(analytics.performance.averageOrderValue), subtitle: `${analytics.performance.totalOrders} total orders`, subtitleClassName: "text-brand-muted", icon: TrendingUp },
    { title: "Quote Response Time", value: analytics.performance.averageQuoteResponseHours === null ? "N/A" : `${analytics.performance.averageQuoteResponseHours.toFixed(1)} hrs`, subtitle: "Average time from RFQ to quote", subtitleClassName: "text-brand-muted", icon: Clock3 },
    { title: "RFQ Conversion", value: `${Math.round(analytics.overview.rfqConversionRate)}%`, subtitle: `${analytics.offerCounts.accepted ?? 0} of ${Object.values(analytics.offerCounts).reduce((sum, value) => sum + value, 0)} offers accepted`, subtitleClassName: "text-brand-muted", icon: TrendingUp },
    { title: "Orders Fulfilled", value: String(analytics.performance.fulfilledOrders), subtitle: `${Math.round(analytics.performance.fulfillmentRate)}% fulfillment rate`, subtitleClassName: "text-primary", icon: Package },
    { title: "Repeat Customers", value: `${Math.round(analytics.performance.repeatCustomerRate)}%`, subtitle: "Customers with multiple orders", subtitleClassName: "text-primary", icon: Users },
  ]
  const products: TopSellingProduct[] = analytics.topProducts.map((product, index) => ({ rank: index + 1, name: product.name, unitsSold: `${product.unitsSold} units sold`, revenue: currency(product.revenue) }))

  return <div className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8"><div><h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1><p className="mt-2 text-sm text-brand-muted">Live metrics calculated from your RFQ quotes, orders, customers, and inventory.</p></div><PerformanceMetricGrid metrics={metrics} /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><RevenueTrendChart data={analytics.revenueTrend} /><OrderStatusChart counts={analytics.orderCounts} /></div><TopSellingProductsCard products={products} /></div></div>
}
