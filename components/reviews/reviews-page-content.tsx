import { Star } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type {
  SupplierReview,
  SupplierReviewPagination,
} from "@/lib/supplier-reviews.server"
import { appRoutes } from "@/lib/routes"

type ReviewsPageContentProps = {
  reviews: SupplierReview[]
  pagination: SupplierReviewPagination
  error?: string | null
}

const ratingAverage = (reviews: SupplierReview[]) =>
  reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? "fill-primary text-primary" : "text-border"
          }`}
        />
      ))}
    </div>
  )
}

const reviewsHref = (page: number) =>
  page > 1 ? `${appRoutes.reviews}?page=${page}` : appRoutes.reviews

export function ReviewsPageContent({
  reviews,
  pagination,
  error,
}: ReviewsPageContentProps) {
  const average = ratingAverage(reviews)
  const rangeStart = pagination.total
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0
  const rangeEnd = Math.min(pagination.page * pagination.pageSize, pagination.total)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="mt-2 text-sm text-brand-muted">
            Customer reviews grouped by delivered order item and product.
          </p>
        </div>

        {error ? (
          <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="surface-card rounded-sm shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-brand-muted">Average rating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {reviews.length ? average.toFixed(1) : "No ratings"}
              </p>
            </CardContent>
          </Card>
          <Card className="surface-card rounded-sm shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-brand-muted">Total reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{reviews.length}</p>
            </CardContent>
          </Card>
          <Card className="surface-card rounded-sm shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-brand-muted">Reviewed products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Set(reviews.map((review) => review.partUid)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card overflow-hidden rounded-sm py-0 shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface text-left text-brand-muted">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Review</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-t border-border">
                    <td className="p-4 font-semibold text-primary">
                      {review.orderPublicId}
                      <p className="mt-1 text-xs font-normal capitalize text-brand-muted">
                        {review.orderSource}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{review.partName}</p>
                      <p className="mt-1 text-xs text-brand-muted">
                        {review.partNumber || "No part number"}
                      </p>
                    </td>
                    <td className="p-4">{review.customerName}</td>
                    <td className="p-4">
                      <Stars rating={review.rating} />
                      <p className="mt-1 text-xs text-brand-muted">
                        {review.rating}/5
                      </p>
                    </td>
                    <td className="max-w-md p-4 text-brand-muted">
                      {review.comment}
                    </td>
                    <td className="p-4 text-brand-muted">
                      {dateLabel(review.createdAt)}
                    </td>
                  </tr>
                ))}
                {!reviews.length ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-brand-muted">
                      No product reviews yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {rangeStart}-{rangeEnd} of {pagination.total} reviews.
          </p>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
            >
              <Link
                href={reviewsHref(Math.max(1, pagination.page - 1))}
                aria-disabled={pagination.page <= 1}
              >
                Previous
              </Link>
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
            >
              <Link
                href={reviewsHref(Math.min(pagination.totalPages, pagination.page + 1))}
                aria-disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
