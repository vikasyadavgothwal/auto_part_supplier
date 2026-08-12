import { cookies } from "next/headers"

import { PerformancePageContent } from "@/components/performance/performance-page-content"
import { requestBackend } from "@/lib/auth/backend"
import { getSupplierAnalytics } from "@/lib/supplier-analytics.server"

export const dynamic = "force-dynamic"

type AccessPayload = {
  access?: Array<{
    businessAccount: { type: string }
    actions?: Record<string, { allowed: boolean; reason: string | null }>
  }>
}

export default async function PerformancePage() {
  const cookieHeader = (await cookies()).toString()
  const accessResponse = await requestBackend("/api/v1/business/access", { cookieHeader }).catch(() => null)
  const accessPayload = accessResponse?.ok ? await accessResponse.json() as AccessPayload : null
  const access = accessPayload?.access?.find((item) => item.businessAccount.type === "Supplier")
  let analytics = null
  let error: string | null = null
  try {
    analytics = await getSupplierAnalytics(cookieHeader, "performance")
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load performance"
  }
  return <PerformancePageContent analytics={analytics} error={error} showUsage={Boolean(access?.actions?.["reports.usage"]?.allowed)} showActivity={Boolean(access?.actions?.["reports.activity"]?.allowed)} />
}
