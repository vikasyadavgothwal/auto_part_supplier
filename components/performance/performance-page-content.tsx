import {
  customerFeedback,
  performanceMetrics,
  topSellingProducts,
} from "./data"
import { ChartPlaceholder } from "./chart-placeholder"
import { CustomerFeedbackCard } from "./customer-feedback-card"
import { PerformanceMetricGrid } from "./performance-metric-grid"
import { TopSellingProductsCard } from "./top-selling-products-card"

export function PerformancePageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Performance Analytics
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Track your business metrics and customer satisfaction.
          </p>
        </div>

        <PerformanceMetricGrid metrics={performanceMetrics} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartPlaceholder title="Revenue Trend (30 Days)" />
          <ChartPlaceholder title="Orders by Status" />
        </div>

        <TopSellingProductsCard products={topSellingProducts} />

        <CustomerFeedbackCard feedbackItems={customerFeedback} />
      </div>
    </div>
  )
}
