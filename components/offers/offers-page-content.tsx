import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { offers, offerStats, offerTips } from "./data"
import { OffersTable } from "./offers-table"

export function OffersPageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Offers
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Track your quote submissions and win rates.
          </p>
        </div>

        <SummaryStatGrid stats={offerStats} />

        <OffersTable offers={offers} />

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">
              Improve Your Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {offerTips.map((tip) => (
                <div key={tip.title}>
                  <div className="mb-2 font-semibold text-primary">
                    {tip.title}
                  </div>
                  <p className="text-sm text-brand-muted">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
