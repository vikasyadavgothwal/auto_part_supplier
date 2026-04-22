import { Plus, TriangleAlert, Upload } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { inventoryStats, products } from "./data"
import { InventoryProductsTable } from "./inventory-products-table"

export function InventoryPageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Inventory
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Manage your product catalog and stock levels.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-12 rounded-sm border-border bg-brand-panel-strong px-6 text-foreground hover:border-primary hover:bg-brand-panel-strong"
            >
              <Upload className="mr-2 h-5 w-5" />
              Import CSV
            </Button>
            <Button className="h-12 rounded-sm px-6 hover:bg-brand-primary-hover">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>

        <SummaryStatGrid stats={inventoryStats} />

        <Alert className="border-brand-warning/20 bg-brand-warning/10 text-foreground">
          <TriangleAlert className="h-5 w-5 !text-brand-warning" />
          <AlertTitle className="text-brand-warning">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-sm text-brand-muted">
            2 products have low stock. Consider restocking to avoid missed sales.
          </AlertDescription>
        </Alert>

        <InventoryProductsTable products={products} />

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Product Mapping</CardTitle>
            <CardDescription className="text-brand-muted">
              Map your products to vehicle fitment data to appear in search
              results and receive relevant RFQs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="rounded-sm px-6 text-sm hover:bg-brand-primary-hover">
              Learn About Mapping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
