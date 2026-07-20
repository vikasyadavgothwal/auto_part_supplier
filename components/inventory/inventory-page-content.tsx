"use client"

import { useState } from "react"
import { Plus, Search, TriangleAlert, Upload } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { authenticatedFetch } from "@/lib/auth/client"

import { BulkImportDialog } from "./bulk-import-dialog"
import { InventoryProductsTable } from "./inventory-products-table"
import { buildInventoryStats, mapSupplierPartToProduct } from "./mappers"
import { ProductMasterForm } from "./product-master-form"
import type { InventoryPagination, Product, SupplierPartsListResponse } from "./types"

type Props = { initialProducts: Product[]; initialPagination: InventoryPagination; loadError?: string | null }
type Feedback = { tone: "success" | "error"; title: string; message: string }

export function InventoryPageContent({ initialProducts, initialPagination, loadError = null }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [productsError, setProductsError] = useState("")
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(loadError ? { tone:"error", title:"Inventory backend unavailable", message:loadError } : null)

  const stats = buildInventoryStats(products)
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 12).length

  async function loadProducts(page: number, query = searchQuery) {
    setIsLoading(true); setProductsError("")
    try {
      const params = new URLSearchParams({ page:String(page), pageSize:"10", q:query.trim(), status:"mapped" })
      const response = await authenticatedFetch(`/api/supplier/parts?${params}`)
      const payload = await response.json() as SupplierPartsListResponse
      if (!response.ok || !payload.ok || !payload.parts || !payload.pagination) throw new Error(payload.message ?? "Unable to load inventory")
      setProducts(payload.parts.map(mapSupplierPartToProduct)); setPagination(payload.pagination)
    } catch (error) { setProductsError(error instanceof Error ? error.message : "Unable to load inventory") }
    finally { setIsLoading(false) }
  }

  return <div className="min-h-screen min-w-0 bg-background text-foreground">
    <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Inventory</h1><p className="mt-2 text-sm text-brand-muted">Manage mapped products available in your supplier inventory.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="h-12 rounded-sm px-6" onClick={() => setIsBulkDialogOpen(true)}><Upload className="mr-2 size-5" />Import Excel</Button>
          <Button className="h-12 rounded-sm px-6" onClick={() => { setEditingProduct(null); setIsProductFormOpen(true) }}><Plus className="mr-2 size-5" />Add Single Product</Button>
        </div>
      </div>
      <SummaryStatGrid stats={stats} />
      {feedback ? <Alert className={feedback.tone === "error" ? "border-destructive/20 bg-destructive/10" : "border-brand-success/20 bg-brand-success/10"}><TriangleAlert className={feedback.tone === "error" ? "!text-destructive" : "!text-brand-success"} /><AlertTitle>{feedback.title}</AlertTitle><AlertDescription className="text-brand-muted">{feedback.message}</AlertDescription></Alert> : null}
      <Alert className="border-brand-warning/20 bg-brand-warning/10"><TriangleAlert className="!text-brand-warning" /><AlertTitle className="text-brand-warning">Low Stock Alert</AlertTitle><AlertDescription className="text-brand-muted">{lowStockCount ? `${lowStockCount} products have low stock.` : "No products are currently low on stock."}</AlertDescription></Alert>
      <form className="flex max-w-2xl flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void loadProducts(1) }}>
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search SKU, product, MPN, OEM, or brand..." className="pl-9" /></div>
        <Button type="submit" disabled={isLoading}>Search</Button>{searchQuery ? <Button type="button" variant="outline" onClick={() => { setSearchQuery(""); void loadProducts(1, "") }}>Clear</Button> : null}
      </form>
      {productsError ? <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{productsError}</p> : null}
      <InventoryProductsTable products={products} onEditProduct={(product) => { setEditingProduct(product); setIsProductFormOpen(true) }} />
      <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between"><p>Showing {products.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} products</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={isLoading || pagination.page <= 1} onClick={() => void loadProducts(pagination.page - 1)}>Previous</Button><span>Page {pagination.page} of {pagination.totalPages}</span><Button size="sm" variant="outline" disabled={isLoading || pagination.page >= pagination.totalPages} onClick={() => void loadProducts(pagination.page + 1)}>Next</Button></div></div>
      <Card className="surface-card rounded-sm shadow-none"><CardHeader className="pb-3"><CardTitle>Product Mapping</CardTitle><CardDescription>Only mapped products appear in this inventory. Single-product and Excel entries check the local catalog first, then 17VIN.</CardDescription></CardHeader><CardContent className="text-sm text-brand-muted">Unconfirmed products remain available to Admin for mapping review and appear here automatically after they are mapped.</CardContent></Card>
    </div>
    <ProductMasterForm key={editingProduct?.id ?? "new"} open={isProductFormOpen} onOpenChange={setIsProductFormOpen} product={editingProduct} onSaved={(part, message) => { const mapped = mapSupplierPartToProduct(part); setProducts((current) => editingProduct ? current.map((item) => item.id === mapped.id ? mapped : item) : [mapped, ...current].slice(0, pagination.pageSize)); setFeedback({ tone:"success", title:editingProduct ? "Product updated" : "Product added", message }); setEditingProduct(null); void loadProducts(editingProduct ? pagination.page : 1) }} />
    <BulkImportDialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen} onProductsImported={() => void loadProducts(1)} />
  </div>
}
