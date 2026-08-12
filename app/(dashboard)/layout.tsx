import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/app-header"
import { SessionKeepalive } from "@/components/auth/session-keepalive"
import { ToastProvider } from "@/components/ui/toast-provider"
import { requireDashboardUser } from "@/lib/auth/server"
import { requestBackend } from "@/lib/auth/backend"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

type BusinessAccessPayload = {
  ok: boolean
  access?: Array<{
    businessAccount: { type: string; isOwner?: boolean; plan: { name: string; code: string } }
    visibleMenus: string[]
    activeAddOns?: Array<{ featureKey: string }>
    enabledFeatures?: string[]
  }>
}

const isApiFeature = (feature: string) => feature === "api.standard" || feature === "api.enterprise"

const isFreePlan = (plan?: { code: string; name: string }) =>
  plan?.code === "Free" || /\bfree\b/i.test(plan?.name ?? "")

async function getBusinessAccess() {
  const response = await requestBackend("/api/v1/business/access", {
    cookieHeader: (await cookies()).toString(),
  }).catch(() => null)
  if (!response?.ok) return { visibleMenus: [], planName: null }
  const payload = (await response.json()) as BusinessAccessPayload
  const access = payload.access?.find((item) => item.businessAccount.type === "Supplier")
  const freePlan = isFreePlan(access?.businessAccount.plan)
  const hasApiAddOn = access?.activeAddOns?.some((item) => isApiFeature(item.featureKey)) ?? false
  const hasPlanApiAccess =
    !freePlan &&
    (access?.enabledFeatures?.some(isApiFeature) ?? false)
  return {
    visibleMenus: (access?.visibleMenus ?? []).filter((menu) => menu !== "api-keys" || hasPlanApiAccess || hasApiAddOn),
    planName: access?.businessAccount.plan.name ?? null,
    isOwner: access?.businessAccount.isOwner ?? false,
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [user, profile, businessAccess] = await Promise.all([
    requireDashboardUser("Supplier"),
    getSupplierSettings(),
    getBusinessAccess(),
  ])

  return (
    <SidebarProvider>
      <ToastProvider>
        <SessionKeepalive />
        <AppSidebar profile={profile} visibleMenus={businessAccess.visibleMenus} planName={businessAccess.planName} isOwner={businessAccess.isOwner} />
        <SidebarInset className="min-h-svh min-w-0 overflow-x-hidden bg-brand-surface">
          <DashboardHeader user={user} />
          <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden p-4 lg:p-6">
            {children}
          </div>
        </SidebarInset>
      </ToastProvider>
    </SidebarProvider>
  )
}
