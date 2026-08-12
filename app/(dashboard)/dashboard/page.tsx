import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content"
import { getSupplierAnalytics } from "@/lib/supplier-analytics.server"
import { getSupplierSettings } from "@/lib/supplier-settings.server"
import { supplierCanAccessDashboard } from "@/lib/supplier-settings"

export const dynamic = "force-dynamic"

export default async function SupplierDashboard() {
  const profile = await getSupplierSettings()
  if (!supplierCanAccessDashboard(profile)) {
    redirect("/settings")
  }

  let analytics = null
  let error: string | null = null
  try {
    analytics = await getSupplierAnalytics((await cookies()).toString(), "dashboard")
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load overview"
  }
  return <DashboardPageContent analytics={analytics} error={error} />
}
