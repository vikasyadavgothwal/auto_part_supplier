"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Box,
  Settings,
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

import { appRoutes, stripBasePath } from "@/lib/routes"

const items = [
  { title: "Dashboard", url: appRoutes.dashboard, icon: House },
  { title: "RFQ Inbox", url: appRoutes.rfqInbox, svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5007 1.66667H5.00065C4.55862 1.66667 4.1347 1.84227 3.82214 2.15483C3.50958 2.46739 3.33398 2.89131 3.33398 3.33334V16.6667C3.33398 17.1087 3.50958 17.5326 3.82214 17.8452C4.1347 18.1577 4.55862 18.3333 5.00065 18.3333H15.0007C15.4427 18.3333 15.8666 18.1577 16.1792 17.8452C16.4917 17.5326 16.6673 17.1087 16.6673 16.6667V5.83334L12.5007 1.66667Z" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.666 1.66667V5.00001C11.666 5.44203 11.8416 5.86596 12.1542 6.17852C12.4667 6.49108 12.8907 6.66667 13.3327 6.66667H16.666" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.33268 7.5H6.66602" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3327 10.8333H6.66602" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3327 14.1667H6.66602" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
  { title: "Orders", url: appRoutes.orders, svg : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.66732 18.3333C7.12756 18.3333 7.50065 17.9602 7.50065 17.5C7.50065 17.0398 7.12756 16.6667 6.66732 16.6667C6.20708 16.6667 5.83398 17.0398 5.83398 17.5C5.83398 17.9602 6.20708 18.3333 6.66732 18.3333Z" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.8333 18.3333C16.2936 18.3333 16.6667 17.9602 16.6667 17.5C16.6667 17.0398 16.2936 16.6667 15.8333 16.6667C15.3731 16.6667 15 17.0398 15 17.5C15 17.9602 15.3731 18.3333 15.8333 18.3333Z" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.70898 1.70833H3.37565L5.59232 12.0583C5.67363 12.4374 5.88454 12.7762 6.18874 13.0165C6.49294 13.2569 6.87141 13.3836 7.25898 13.375H15.409C15.7883 13.3744 16.1561 13.2444 16.4515 13.0065C16.747 12.7686 16.9524 12.4371 17.034 12.0667L18.409 5.87499H4.26732" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
  { title: "Inventory", url: appRoutes.inventory, icon: Box },
  { title: "Offers", url: appRoutes.offers, svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 2.5V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H17.5" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 14.1667V7.5" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.834 14.1667V4.16666" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.66602 14.1667V11.6667" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
  { title: "Performance", url: appRoutes.performance, svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 2.5V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H17.5" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 14.1667V7.5" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.834 14.1667V4.16666" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.66602 14.1667V11.6667" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
]
export function AppSidebar() {
  const currentPath = stripBasePath(usePathname())
  return (
    <Sidebar className="border-sidebar-border bg-brand-panel text-foreground">
      <SidebarHeader className="border-b border-border px-6 py-6">
        <Link href={appRoutes.dashboard} className="block">
          <h2 className="text-xl font-bold">AutoPartsPro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Supplier 
          </p>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto px-4 py-4">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
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
                  <Link href={item.url} className="flex items-center gap-3">
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.svg && (
                      <span
                        className="h-5 w-5"
                        dangerouslySetInnerHTML={{ __html: item.svg }}
                      />
                    )}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
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
      </SidebarFooter>
    </Sidebar>
  )
}
