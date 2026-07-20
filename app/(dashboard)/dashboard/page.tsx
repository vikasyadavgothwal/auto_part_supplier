import { cookies } from "next/headers"

import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content"
import { getSupplierAnalytics } from "@/lib/supplier-analytics.server"

export const dynamic = "force-dynamic"

export default async function SupplierDashboard() {
  let analytics = null
  let error: string | null = null
  try {
    analytics = await getSupplierAnalytics((await cookies()).toString())
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load overview"
  }
  return <DashboardPageContent analytics={analytics} error={error} />
}
