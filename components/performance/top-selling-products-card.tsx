import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { TopSellingProduct } from "./types"

type TopSellingProductsCardProps = {
  products: readonly TopSellingProduct[]
}

export function TopSellingProductsCard({
  products,
}: TopSellingProductsCardProps) {
  return (
    <Card className="surface-card rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-foreground">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="py-10 text-center text-brand-muted">No sold products yet.</p>
          ) : null}
          {products.map((product) => (
            <div
              key={product.rank}
              className="flex items-center justify-between rounded-sm bg-brand-surface p-4"
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
  )
}
