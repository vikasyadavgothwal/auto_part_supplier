import {
  dashboardRfqs,
  dashboardStats,
  integrations,
  quickLinks,
  recentOrders,
} from "./data"
import { DashboardStatCards } from "./dashboard-stat-cards"
import { IntegrationStatusCard } from "./integration-status-card"
import { QuickLinkGrid } from "./quick-link-grid"
import { RecentOrdersSection } from "./recent-orders-section"
import { RfqInboxSection } from "./rfq-inbox-section"
import { TrustScoreCard } from "./trust-score-card"

export function DashboardPageContent() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-[#9CA3AF]">
          Monitor your business performance and manage operations.
        </p>
      </div>

      <DashboardStatCards stats={dashboardStats} />

      <QuickLinkGrid links={quickLinks} />

      <RfqInboxSection rfqs={dashboardRfqs} />

      <RecentOrdersSection orders={recentOrders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustScoreCard />
        <IntegrationStatusCard integrations={integrations} />
      </div>
    </div>
  )
}
