import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartPlaceholder({ title }: { title: string }) {
  return (
    <Card className="surface-card rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-sm bg-brand-surface">
          <p className="text-sm text-brand-muted">
            Chart visualization would go here
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
