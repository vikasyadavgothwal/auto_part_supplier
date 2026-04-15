"use client"

import {
  Clock3,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics = [
  {
    title: "Monthly Revenue",
    value: "$48,920",
    subtitle: "Up 23% vs last month",
    subtitleClassName: "text-primary",
    icon: DollarSign,
  },
  {
    title: "Customer Rating",
    value: "4.8 / 5.0",
    subtitle: "Based on 234 reviews",
    subtitleClassName: "text-brand-muted",
    icon: Star,
  },
  {
    title: "Response Time",
    value: "2.4 hrs",
    subtitle: "15% faster than last month",
    subtitleClassName: "text-primary",
    icon: Clock3,
  },
  {
    title: "RFQ Conversion",
    value: "68%",
    subtitle: "Last 30 days",
    subtitleClassName: "text-brand-muted",
    icon: TrendingUp,
  },
  {
    title: "Orders Fulfilled",
    value: "156",
    subtitle: "Up 12% vs last month",
    subtitleClassName: "text-primary",
    icon: Package,
  },
  {
    title: "Repeat Customers",
    value: "42%",
    subtitle: "Up 8% increase",
    subtitleClassName: "text-primary",
    icon: Users,
  },
] as const

const topSellingProducts = [
  { rank: 1, name: "Brake Pads - Front", unitsSold: "45 units sold", revenue: "$4,049.55" },
  { rank: 2, name: "Oil Filter", unitsSold: "89 units sold", revenue: "$1,156.11" },
  { rank: 3, name: "Air Filter", unitsSold: "67 units sold", revenue: "$1,339.33" },
  { rank: 4, name: "Spark Plugs", unitsSold: "124 units sold", revenue: "$1,395.00" },
]

const customerFeedback = [
  {
    name: "John Doe",
    rating: 5,
    feedback: "Fast shipping and excellent product quality!",
    time: "Yesterday",
  },
  {
    name: "Jane Smith",
    rating: 5,
    feedback: "Great prices and responsive customer service.",
    time: "2 days ago",
  },
  {
    name: "Mike Johnson",
    rating: 4,
    feedback: "Good quality parts, delivery was a bit slow.",
    time: "3 days ago",
  },
]

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <Card className="surface-card rounded-lg shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg bg-brand-surface">
          <p className="text-sm text-brand-muted">Chart visualization would go here</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FeedbackStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={[
            "h-4 w-4",
            index < rating ? "fill-primary text-primary" : "text-border",
          ].join(" ")}
        />
      ))}
    </div>
  )
}

export default function PerformancePage() {
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Card
                key={metric.title}
                className="surface-card rounded-lg shadow-none transition-all hover:border-primary"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="text-sm font-medium text-brand-muted">
                      {metric.title}
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <div className={`text-sm ${metric.subtitleClassName}`}>
                    {metric.subtitle}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartPlaceholder title="Revenue Trend (30 Days)" />
          <ChartPlaceholder title="Orders by Status" />
        </div>

        <Card className="surface-card rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product) => (
                <div
                  key={product.rank}
                  className="flex items-center justify-between rounded-lg bg-brand-surface p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">
                      #{product.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {product.name}
                      </div>
                      <div className="text-sm text-brand-muted">
                        {product.unitsSold}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {product.revenue}
                    </div>
                    <div className="text-sm text-brand-muted">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">
              Recent Customer Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerFeedback.map((item) => (
                <div
                  key={`${item.name}-${item.time}`}
                  className="rounded-lg border border-border bg-brand-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <FeedbackStars rating={item.rating} />
                  </div>
                  <p className="mb-2 text-sm text-brand-muted">{item.feedback}</p>
                  <div className="text-xs text-brand-muted">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
