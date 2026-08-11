"use client"

import { useState } from "react"
import { Download, Plus, Search, TriangleAlert, Upload } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { useToast } from "@/components/ui/toast-provider"
import { authenticatedFetch } from "@/lib/auth/client"

import { BulkImportDialog } from "./bulk-import-dialog"
import { InventoryProductsTable } from "./inventory-products-table"
import { buildInventoryStats, mapSupplierPartToProduct } from "./mappers"
import { ProductMasterForm } from "./product-master-form"
import type {
  InventoryPagination,
  Product,
  SupplierPartsListResponse,
} from "./types"

type Props = {
  initialProducts: Product[]
  initialPagination: InventoryPagination
  loadError?: string | null
}

export function InventoryPageContent({
  initialProducts,
  initialPagination,
  loadError = null,
}: Props) {
  const { showToast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExportingCatalogue, setIsExportingCatalogue] = useState(false)
  const [isExportingInventory, setIsExportingInventory] = useState(false)
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [productsError, setProductsError] = useState("")
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [loadFeedback] = useState(loadError)

  const stats = buildInventoryStats(products)
  const lowStockCount = products.filter(
    (product) => product.isActive && product.stock > 0 && product.stock <= 12,
  ).length
  const inactiveProductCount = products.filter((product) => !product.isActive).length

  async function loadProducts(page: number, query = searchQuery) {
    setIsLoading(true)
    setProductsError("")
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        q: query.trim(),
        status: "mapped",
      })
      const response = await authenticatedFetch(`/api/supplier/parts?${params}`)
      const payload = (await response.json()) as SupplierPartsListResponse
      if (
        !response.ok ||
        !payload.ok ||
        !payload.parts ||
        !payload.pagination
      ) {
        throw new Error(payload.message ?? "Unable to load inventory")
      }
      setProducts(payload.parts.map(mapSupplierPartToProduct))
      setPagination(payload.pagination)
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Unable to load inventory",
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!product.id) {
      throw new Error("Product id is missing")
    }
    const response = await authenticatedFetch(`/api/supplier/parts/${product.id}`, {
      method: "DELETE",
    })
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.message ?? "Unable to delete product")
    }
    showToast({
      type: "success",
      title: "Product deleted",
      message: `${product.productName} was removed from your inventory.`,
    })
    await loadProducts(pagination.page)
  }

  const parseExportFilename = (disposition: string | null) => {
    if (!disposition) return null
    const match = disposition.match(
      /filename\*?=(?:UTF-8''|")?([^";\n]+)(?:[";])?/,
    )
    return match ? match[1].replace(/"/g, "") : null
  }

  const downloadExport = async (
    endpoint: string,
    fallbackFileName: string,
    setLoading: (loading: boolean) => void,
  ) => {
    setLoading(true)
    try {
      const response = await authenticatedFetch(endpoint)
      if (!response.ok) {
        const payload = await response.text()
        throw new Error(payload || "Unable to export file")
      }
      const format = response.headers.get("x-export-format")
      const fileName =
        parseExportFilename(response.headers.get("content-disposition")) ??
        fallbackFileName
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = fileName
      link.click()
      URL.revokeObjectURL(blobUrl)

      showToast({
        type: "success",
        title: "Export ready",
        message:
          format === "csv"
            ? "Export completed as CSV because XLSX generation was unavailable."
            : "Your export has been downloaded.",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to export this file"
      showToast({ type: "error", title: "Export failed", message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="mt-2 text-sm text-brand-muted">
              Manage mapped products available in your supplier inventory.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-12 rounded-sm px-6"
              disabled={isExportingCatalogue}
              onClick={() =>
                void downloadExport(
                  "/api/supplier/parts/export/products/catalogue",
                  "supplier-products-catalogue.xlsx",
                  setIsExportingCatalogue,
                )
              }
            >
              <Download className="mr-2 size-5" />
              {isExportingCatalogue ? "Exporting..." : "Export Products"}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-sm px-6"
              disabled={isExportingInventory}
              onClick={() =>
                void downloadExport(
                  "/api/supplier/parts/export/inventory/stock-prices",
                  "supplier-stock-prices.xlsx",
                  setIsExportingInventory,
                )
              }
            >
              <Download className="mr-2 size-5" />
              {isExportingInventory ? "Exporting..." : "Export Stock & Prices"}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-sm px-6"
              disabled={isExportingCsv}
              onClick={() =>
                void downloadExport(
                  "/api/supplier/parts/export/products/csv",
                  "supplier-product-master.csv",
                  setIsExportingCsv,
                )
              }
            >
              <Download className="mr-2 size-5" />
              {isExportingCsv ? "Exporting..." : "Export CSV"}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-sm px-6"
              onClick={() => setIsBulkDialogOpen(true)}
            >
              <Upload className="mr-2 size-5" />
              Import Excel
            </Button>
            <Button
              className="h-12 rounded-sm px-6"
              onClick={() => {
                setEditingProduct(null)
                setIsProductFormOpen(true)
              }}
            >
              <Plus className="mr-2 size-5" />
              Add Single Product
            </Button>
          </div>
        </div>

        <SummaryStatGrid stats={stats} />

        {loadFeedback ? (
          <Alert className="border-destructive/20 bg-destructive/10">
            <TriangleAlert className="!text-destructive" />
            <AlertTitle>Inventory backend unavailable</AlertTitle>
            <AlertDescription className="text-brand-muted">
              {loadFeedback}
            </AlertDescription>
          </Alert>
        ) : null}

        <Alert className="border-brand-warning/20 bg-brand-warning/10">
          <TriangleAlert className="!text-brand-warning" />
          <AlertTitle className="text-brand-warning">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-brand-muted">
            {lowStockCount
              ? `${lowStockCount} products have low stock.`
              : "No products are currently low on stock."}
          </AlertDescription>
        </Alert>

        <form
          className="flex max-w-2xl flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            void loadProducts(1)
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search SKU, product, MPN, OEM, or brand..."
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
          {searchQuery ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                void loadProducts(1, "")
              }}
            >
              Clear
            </Button>
          ) : null}
        </form>

        {productsError ? (
          <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {productsError}
          </p>
        ) : null}

        {inactiveProductCount ? (
          <Alert className="border-brand-warning/30 bg-brand-warning/10">
            <TriangleAlert className="!text-brand-warning" />
            <AlertTitle className="text-brand-warning">
              {inactiveProductCount} product{inactiveProductCount === 1 ? " is" : "s are"} inactive
            </AlertTitle>
            <AlertDescription className="text-brand-muted">
              These products exceed your current product, brand, or category limits. Upgrade your plan to activate them, or delete products you no longer need.
            </AlertDescription>
          </Alert>
        ) : null}

        <InventoryProductsTable
          products={products}
          onEditProduct={(product) => {
            setEditingProduct(product)
            setIsProductFormOpen(true)
          }}
          onDeleteProduct={deleteProduct}
          onUpgradePlan={() => {
            window.location.href = "/plans"
          }}
        />

        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            {products.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
            -{Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading || pagination.page <= 1}
              onClick={() => void loadProducts(pagination.page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading || pagination.page >= pagination.totalPages}
              onClick={() => void loadProducts(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader className="pb-3">
            <CardTitle>Product Mapping</CardTitle>
            <CardDescription>
              Only mapped products appear in this inventory. Single-product and Excel
              entries check the local catalog first, then 17VIN.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-brand-muted">
            Unconfirmed products remain available to Admin for mapping review and
            appear here automatically after they are mapped.
          </CardContent>
        </Card>
      </div>

      <ProductMasterForm
        key={editingProduct?.id ?? "new"}
        open={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        product={editingProduct}
        onSaved={(part, message) => {
          const mapped = mapSupplierPartToProduct(part)
          setProducts((current) =>
            editingProduct
              ? current.map((item) => (item.id === mapped.id ? mapped : item))
              : [mapped, ...current].slice(0, pagination.pageSize),
          )
          showToast({
            type: "success",
            title: editingProduct ? "Product Updated" : "Product Added",
            message,
          })
          setEditingProduct(null)
          void loadProducts(editingProduct ? pagination.page : 1)
        }}
      />
      <BulkImportDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        onProductsImported={() => void loadProducts(1)}
      />
    </div>
  )
}
