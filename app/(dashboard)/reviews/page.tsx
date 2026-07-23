import { ReviewsPageContent } from "@/components/reviews/reviews-page-content"
import {
  getSupplierReviews,
  type SupplierReviewPagination,
  type SupplierReview,
} from "@/lib/supplier-reviews.server"

type ReviewsPageProps = {
  searchParams?: Promise<{ page?: string }>
}

const fallbackPagination: SupplierReviewPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams
  const page = Number.parseInt(params?.page ?? "1", 10)
  let reviews: SupplierReview[] = []
  let pagination = fallbackPagination
  let error: string | null = null

  try {
    const data = await getSupplierReviews(page)
    reviews = data.reviews
    pagination = data.pagination
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load reviews"
  }

  return (
    <ReviewsPageContent
      reviews={reviews}
      pagination={pagination}
      error={error}
    />
  )
}
