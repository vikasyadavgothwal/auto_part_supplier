import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/app-header"
import { SessionKeepalive } from "@/components/auth/session-keepalive"
import { ToastProvider } from "@/components/ui/toast-provider"
import { requireDashboardUser } from "@/lib/auth/server"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [user, profile] = await Promise.all([
    requireDashboardUser("Supplier"),
    getSupplierSettings(),
  ])

  return (
    <SidebarProvider>
      <ToastProvider>
        <SessionKeepalive />
        <AppSidebar profile={profile} />
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
