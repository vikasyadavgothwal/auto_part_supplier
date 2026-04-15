"use client"

import Link from "next/link"
import { ArrowLeft, House, Package, SearchX, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { appRoutes } from "@/lib/routes"

const helpfulLinks = [
  {
    title: "Open Dashboard",
    description: "Return to the supplier overview and latest KPIs.",
    href: appRoutes.dashboard,
  },
  {
    title: "RFQ Inbox",
    description: "Review quote requests and respond to buyers.",
    href: appRoutes.rfqInbox,
  },
  {
    title: "Orders",
    description: "Track shipments, status, and active order flow.",
    href: appRoutes.orders,
  },
  {
    title: "Inventory",
    description: "Check stock levels and low-quantity alerts.",
    href: appRoutes.inventory,
  },
] as const

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <SearchX className="h-12 w-12 text-primary" />
          </div>

          <h1 className="mb-4 text-5xl font-bold text-foreground sm:text-6xl">
            404
          </h1>
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mb-8 text-base text-brand-muted sm:text-xl">
            The page you requested is not available. Use one of the routes below
            to continue through the supplier dashboard.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-border bg-brand-panel px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>

            <Button asChild className="gap-2 px-6 py-3">
              <Link href={appRoutes.dashboard}>
                <House className="h-5 w-5" />
                Go Home
              </Link>
            </Button>
          </div>

          <Card className="surface-card mt-12 text-left">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Helpful Links
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {helpfulLinks.map((item, index) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-lg border border-border bg-brand-surface p-4 transition-all hover:border-primary"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                        {index % 2 === 0 ? (
                          <Package className="h-4 w-4" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-brand-muted">{item.description}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
