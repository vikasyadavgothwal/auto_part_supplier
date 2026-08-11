"use client"

import { useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertCircle,
  House,
  Box,
  Settings,
  FileText,
  ShoppingCart,
  BarChart3,
  Star,
  Headphones,
  Plug,
  KeyRound,
  CirclePlus,
  BadgeCheck,
  Users,
  ShieldCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { appRoutes, stripBasePath } from "@/lib/routes"
import {
  supplierCanAccessDashboard,
  type SupplierProfileRecord,
} from "@/lib/supplier-settings"

const items = [
  { title: "Dashboard", url: appRoutes.dashboard, icon: House, menuKey: "overview" },
  { title: "RFQ Inbox", url: appRoutes.rfqInbox, icon: FileText, menuKey: "rfq-inbox" },
  { title: "Orders", url: appRoutes.orders, icon: ShoppingCart, menuKey: "orders" },
  { title: "Inventory", url: appRoutes.inventory, icon: Box, menuKey: "inventory" },
  { title: "Offers", url: appRoutes.offers, icon: BarChart3, menuKey: "offers" },
  { title: "Reviews", url: appRoutes.reviews, icon: Star, menuKey: "reviews" },
  { title: "Performance", url: appRoutes.performance, icon: BarChart3, menuKey: "performance" },
  { title: "Integrations", url: appRoutes.integrations, icon: Plug, menuKey: "integrations" },
  { title: "API Keys", url: appRoutes.apiKeys, icon: KeyRound, menuKey: "api-keys" },
  { title: "Paid Add-ons", url: appRoutes.addOns, icon: CirclePlus, menuKey: "add-ons" },
  { title: "Support", url: appRoutes.support, icon: Headphones, menuKey: "support" },
  { title: "Staff", url: appRoutes.staff, icon: Users, menuKey: "staff" },
  { title: "Roles", url: appRoutes.roles, icon: ShieldCheck, menuKey: "roles" },
  { title: "Plans", url: appRoutes.plans, icon: BadgeCheck, menuKey: "plans" },
]
const fallbackMenuKeys = items.map((item) => item.menuKey)
const fallbackMenuKeysWithoutApiAccess = fallbackMenuKeys.filter(
  (menuKey) => menuKey !== "api-keys",
)

export function AppSidebar({
  profile,
  visibleMenus = [],
  planName,
  isOwner = false,
}: {
  profile: SupplierProfileRecord
  visibleMenus?: string[]
  planName?: string | null
  isOwner?: boolean
}) {
  const currentPath = stripBasePath(usePathname())
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const canAccessDashboard = supplierCanAccessDashboard(profile)
  const isApprovalPending = profile.supplierApprovalStatus === "Pending"
  const isApprovalRejected = profile.supplierApprovalStatus === "Rejected"
  const modalTitle = isApprovalPending
    ? "Supplier verification in progress"
    : isApprovalRejected
      ? "Document review updates requested"
      : "Upload supplier documents"
  const modalDescription = isApprovalPending
    ? "Your supplier documents have been submitted and are currently under admin review. Once approved, dashboard tools and features will be unlocked automatically."
    : isApprovalRejected
      ? "Please update your verification documents in Settings and resubmit for review."
      : "Please upload your supplier verification documents in Settings. You can use dashboard tools after admin verifies your profile."

  const fallbackMenus =
    isOwner ? fallbackMenuKeysWithoutApiAccess : fallbackMenuKeys
  const effectiveVisibleMenus = visibleMenus.length
    ? visibleMenus
    : isOwner || !planName
      ? fallbackMenus
      : []
  const visibleMenuSet = new Set([
    "settings",
    ...(isOwner ? ["overview", "plans", "add-ons"] : []),
    ...effectiveVisibleMenus,
  ])

  const handleRestrictedNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (canAccessDashboard) return
    event.preventDefault()
    setDocumentDialogOpen(true)
  }

  return (
    <>
      <Sidebar className="border-sidebar-border bg-brand-panel text-foreground">
        <SidebarHeader className="border-b border-border px-6 py-6">
          <Link href={appRoutes.dashboard} className="block">
            <h2 className="text-xl font-bold">AutoPartsPro</h2>
            <p className="mt-1 text-sm text-muted-foreground">Supplier</p>
          </Link>
          {planName && visibleMenuSet.has("plans") ? (
            <Link
              href={appRoutes.plans}
              className="group mt-4 block rounded-lg border border-primary/25 bg-background/70 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.20)] transition hover:border-primary/50 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  Current plan
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-foreground">{planName}</p>
              <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground/80">Manage or upgrade</p>
            </Link>
          ) : null}
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto px-4 py-4">
          <SidebarMenu className="space-y-1">
            {items.filter((item) => visibleMenuSet.has(item.menuKey)).map((item) => {
              const Icon = item.icon
              const isActive =
                currentPath === item.url ||
                currentPath.startsWith(`${item.url}/`)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`h-auto rounded-sm px-4 py-3 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                      onClick={handleRestrictedNavigation}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        {visibleMenuSet.has("settings") ? <SidebarFooter className="border-t border-border p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  currentPath === appRoutes.settings ||
                  currentPath.startsWith(`${appRoutes.settings}/`)
                }
                className={`h-auto rounded-sm px-4 py-3 transition-all ${
                  currentPath === appRoutes.settings ||
                  currentPath.startsWith(`${appRoutes.settings}/`)
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Link
                  href={appRoutes.settings}
                  className="flex items-center gap-3"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter> : null}
      </Sidebar>
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[26rem] overflow-hidden border-border bg-brand-panel p-0 text-foreground shadow-2xl">
          <div className="h-1 bg-destructive" />
          <DialogHeader className="items-center space-y-4 px-5 pb-3 pt-7 text-center sm:px-7">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-destructive/25 bg-destructive/10 text-destructive shadow-[0_0_0_8px_rgba(239,68,68,0.06)]">
              <AlertCircle className="size-8" />
            </div>
            <div className="max-w-sm space-y-2">
              <DialogTitle className="text-xl font-semibold leading-7 text-foreground">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="break-words text-sm leading-6 text-muted-foreground">
                {modalDescription}
              </DialogDescription>
            </div>
          </DialogHeader>
          {profile.supplierApprovalStatus === "Rejected" &&
          profile.supplierApprovalRejectionReason ? (
            <div className="px-5 pb-3 sm:px-7">
              <p className="break-words rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
                {profile.supplierApprovalRejectionReason}
              </p>
            </div>
          ) : null}
          <DialogFooter className="justify-center px-5 pb-7 pt-3 sm:justify-center sm:px-7">
            <Button
              type="button"
              onClick={() => setDocumentDialogOpen(false)}
              className="h-10 min-w-36 bg-primary px-6 text-primary-foreground hover:bg-brand-primary-hover"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
