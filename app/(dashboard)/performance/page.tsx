import { cookies } from "next/headers"

import { PerformancePageContent } from "@/components/performance/performance-page-content"
import { getSupplierAnalytics } from "@/lib/supplier-analytics.server"

export const dynamic = "force-dynamic"

export default async function PerformancePage() {
  let analytics = null
  let error: string | null = null
  try {
    analytics = await getSupplierAnalytics((await cookies()).toString())
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load performance"
  }
  return <PerformancePageContent analytics={analytics} error={error} />
}
