import { Card, CardContent } from "@/components/ui/card"

import type { PerformanceMetric } from "./types"

type PerformanceMetricGridProps = {
  metrics: readonly PerformanceMetric[]
}

export function PerformanceMetricGrid({
  metrics,
}: PerformanceMetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <Card
            key={metric.title}
            className="surface-card rounded-sm shadow-none transition-all hover:border-primary"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="text-sm font-medium text-brand-muted">
                  {metric.title}
                </div>
                <div className="rounded-sm border border-primary/20 bg-primary/10 p-2">
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
  )
}
