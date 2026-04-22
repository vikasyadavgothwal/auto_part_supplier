import { Star } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { CustomerFeedback } from "./types"

type CustomerFeedbackCardProps = {
  feedbackItems: readonly CustomerFeedback[]
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

export function CustomerFeedbackCard({
  feedbackItems,
}: CustomerFeedbackCardProps) {
  return (
    <Card className="surface-card rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-foreground">
          Recent Customer Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbackItems.map((item) => (
            <div
              key={`${item.name}-${item.time}`}
              className="rounded-sm border border-border bg-brand-surface p-4"
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
  )
}
