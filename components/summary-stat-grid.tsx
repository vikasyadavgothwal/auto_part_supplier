import { Card, CardContent } from "@/components/ui/card"

export type SummaryStat = {
  label: string
  value: string
  valueClassName: string
}

type SummaryStatGridProps = {
  stats: readonly SummaryStat[]
}

export function SummaryStatGrid({ stats }: SummaryStatGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="surface-card rounded-sm shadow-none">
          <CardContent className="p-6">
            <div className="text-sm text-brand-muted">{stat.label}</div>
            <div className={`mt-2 text-3xl font-bold ${stat.valueClassName}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
