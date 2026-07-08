"use client"

import { useState, type FormEvent } from "react"
import { CircleCheck, Plus, Search, TriangleAlert, Upload } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"

import { SummaryStatGrid } from "@/components/summary-stat-grid"
import { BulkImportDialog } from "./bulk-import-dialog"
import { InventoryProductsTable } from "./inventory-products-table"
import { buildInventoryStats, mapSupplierPartToProduct } from "./mappers"
import type {
  InventoryPagination,
  Product,
  SupplierPartCreateResponse,
  SupplierPartLookupResult,
  SupplierPartsListResponse,
} from "./types"

type InventoryPageContentProps = {
  initialProducts: Product[]
  initialPagination: InventoryPagination
  loadError?: string | null
}

type Feedback = {
  tone: "success" | "error"
  title: string
  message: string
}

const defaultFeedback: Feedback | null = null

const productImageGuidelines = [
  "Upload JPG, PNG, or WebP only. Maximum 8 images, 5 MB each.",
  "Recommended quality is 1200 × 1200 px or higher with a clear, sharp product view.",
  "Use a plain or white background and keep the full part visible in the frame.",
  "Avoid blurry images, screenshots, watermarks, borders, and supplier logos.",
]

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function ProductImageGuidelines() {
  return (
    <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
      <p className="text-xs font-semibold text-foreground">
        Image quality requirements
      </p>
      <ul className="mt-2 space-y-1 text-xs text-brand-muted">
        {productImageGuidelines.map((guideline) => (
          <li key={guideline} className="flex gap-2">
            <CircleCheck className="mt-0.5 size-3 shrink-0 text-primary" />
            <span>{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InventoryPageContent({
  initialProducts,
  initialPagination,
  loadError = null,
}: InventoryPageContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupResult, setLookupResult] =
    useState<SupplierPartLookupResult | null>(null)
  const [lookupIdentity, setLookupIdentity] = useState({
    vendorSku: "",
    brand: "",
    partNumber: "",
    competitorPartNumber: "",
    competitorBrandName: "",
  })
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(
    loadError
      ? {
          tone: "error",
          title: "Inventory backend unavailable",
          message: loadError,
        }
      : defaultFeedback,
  )

  const inventoryStats = buildInventoryStats(products)
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 12,
  ).length

  async function loadProducts(page: number, query = searchQuery) {
    setIsLoadingProducts(true)
    setProductsError("")
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        q: query.trim(),
      })
      const response = await authenticatedFetch(`/api/supplier/parts?${params}`)
      const payload = (await response.json()) as SupplierPartsListResponse
      if (!response.ok || !payload.ok || !payload.parts || !payload.pagination) {
        throw new Error(payload.message ?? "Unable to load inventory")
      }
      setProducts(payload.parts.map(mapSupplierPartToProduct))
      setPagination(payload.pagination)
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Unable to load inventory",
      )
    } finally {
      setIsLoadingProducts(false)
    }
  }

  function resetAddProductFlow() {
    setLookupResult(null)
    setLookupIdentity({
      vendorSku: "",
      brand: "",
      partNumber: "",
      competitorPartNumber: "",
      competitorBrandName: "",
    })
    setDialogError(null)
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const vendorSku = getFormValue(formData, "vendorSku")
    const brand = getFormValue(formData, "brand")
    const partNumber = getFormValue(formData, "partNumber")
    const competitorPartNumber = getFormValue(formData, "competitorPartNumber")
    const competitorBrandName = getFormValue(formData, "competitorBrandName")
    setIsLookingUp(true)
    setDialogError(null)

    try {
      if (!partNumber && (!brand || !competitorPartNumber)) {
        throw new Error(
          "Enter MPN / OEM number, or enter Brand Name and Competitor OEM Part Number.",
        )
      }

      const response = await authenticatedFetch("/api/supplier/parts/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vendorSku,
          brand,
          partNumber,
          competitorPartNumber,
          competitorBrandName,
        }),
      })
      const payload = (await response.json()) as {
        ok: boolean
        result?: SupplierPartLookupResult
        message?: string
      }
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Unable to check the product")
      }
      setLookupIdentity({
        vendorSku,
        brand,
        partNumber,
        competitorPartNumber,
        competitorBrandName,
      })
      setLookupResult(payload.result)
    } catch (error) {
      setDialogError(
        error instanceof Error ? error.message : "Unable to check the product",
      )
    } finally {
      setIsLookingUp(false)
    }
  }

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!lookupResult) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const price = Number(getFormValue(formData, "price"))
    const stock = Number(getFormValue(formData, "stock"))
    setIsSubmitting(true)
    setDialogError(null)

    try {
      let productDetails:
        | {
            partName: string
            category: string
            badgeText: string
            heading: string
            description: string
            keyFeatures: string[]
            imageUrls: string[]
            imageKeys: string[]
          }
        | undefined

      if (!lookupResult.exists) {
        const imageFiles = formData
          .getAll("images")
          .filter((value): value is File => value instanceof File && value.size > 0)
        if (imageFiles.length === 0) {
          throw new Error("Upload at least one product image")
        }

        const imageFormData = new FormData()
        imageFiles.forEach((file) => imageFormData.append("images", file))
        const imageResponse = await authenticatedFetch(
          "/api/supplier/parts/images",
          {
          method: "POST",
          body: imageFormData,
          },
        )
        const imagePayload = (await imageResponse.json()) as {
          ok: boolean
          images?: Array<{ key: string; url: string }>
          message?: string
        }
        if (!imageResponse.ok || !imagePayload.ok || !imagePayload.images?.length) {
          throw new Error(imagePayload.message ?? "Unable to upload product images")
        }

        productDetails = {
          partName: getFormValue(formData, "partName"),
          category: getFormValue(formData, "category"),
          badgeText: getFormValue(formData, "badgeText"),
          heading: getFormValue(formData, "heading"),
          description: getFormValue(formData, "description"),
          keyFeatures: getFormValue(formData, "keyFeatures")
            .split("\n")
            .map((value) => value.trim())
            .filter(Boolean),
          imageUrls: imagePayload.images.map((image) => image.url),
          imageKeys: imagePayload.images.map((image) => image.key),
        }
      }

      const response = await authenticatedFetch("/api/supplier/parts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partUid: lookupResult.exists
            ? lookupResult.part?.partUid
            : undefined,
          completePartUid: lookupResult.requiresProductDetails
            ? lookupResult.part?.partUid
            : undefined,
          ...lookupIdentity,
          price,
          stock,
          currency: "AED",
          product: productDetails,
        }),
      })
      const payload = (await response.json()) as SupplierPartCreateResponse

      if (!response.ok || !payload.ok || !payload.part) {
        throw new Error(payload.message ?? "Unable to add supplier part")
      }

      await loadProducts(1)
      form.reset()
      setIsDialogOpen(false)
      resetAddProductFlow()
      setFeedback({
        tone: "success",
        title: "Part added",
        message:
          lookupResult.exists
            ? "Your AED price and stock were updated for the existing product."
            : "The product details, images, features, price, and stock were submitted for admin review.",
      })
    } catch (error) {
      setDialogError(
        error instanceof Error ? error.message : "The backend rejected the part.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-8 overflow-x-hidden p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Inventory
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Manage parts, stock levels, and mapping review status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-12 rounded-sm border-border bg-brand-panel-strong px-6 text-foreground hover:border-primary hover:bg-brand-panel-strong"
              onClick={() => setIsBulkDialogOpen(true)}
            >
              <Upload className="mr-2 h-5 w-5" />
              Import CSV
            </Button>
            <Button
              className="h-12 rounded-sm px-6 hover:bg-brand-primary-hover"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>

        <SummaryStatGrid stats={inventoryStats} />

        {feedback ? (
          <Alert
            className={
              feedback.tone === "error"
                ? "border-destructive/20 bg-destructive/10 text-foreground"
                : "border-brand-success/20 bg-brand-success/10 text-foreground"
            }
          >
            <TriangleAlert
              className={
                feedback.tone === "error"
                  ? "h-5 w-5 !text-destructive"
                  : "h-5 w-5 !text-brand-success"
              }
            />
            <AlertTitle
              className={
                feedback.tone === "error"
                  ? "text-destructive"
                  : "text-brand-success"
              }
            >
              {feedback.title}
            </AlertTitle>
            <AlertDescription className="text-sm text-brand-muted">
              {feedback.message}
            </AlertDescription>
          </Alert>
        ) : null}

        <Alert className="border-brand-warning/20 bg-brand-warning/10 text-foreground">
          <TriangleAlert className="h-5 w-5 !text-brand-warning" />
          <AlertTitle className="text-brand-warning">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-sm text-brand-muted">
            {lowStockCount === 0
              ? "No products are currently low on stock."
              : `${lowStockCount} products have low stock. Consider restocking to avoid missed sales.`}
          </AlertDescription>
        </Alert>

        <form
          className="flex max-w-2xl gap-2"
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
          <Button type="submit" disabled={isLoadingProducts}>Search</Button>
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

        <InventoryProductsTable
          products={products}
          onProductUpdated={(updatedProduct) =>
            setProducts((current) =>
              current.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product,
              ),
            )
          }
        />

        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {products.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}-
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isLoadingProducts || pagination.page <= 1}
              onClick={() => void loadProducts(pagination.page - 1)}
            >
              Previous
            </Button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoadingProducts || pagination.page >= pagination.totalPages}
              onClick={() => void loadProducts(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Product Mapping</CardTitle>
            <CardDescription className="text-brand-muted">
              Submitted parts are checked automatically. Mapped products become
              available in your inventory; unmatched products are returned for
              correction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="rounded-sm px-6 text-sm hover:bg-brand-primary-hover">
              Learn About Mapping
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetAddProductFlow()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground">
              Add Supplier Part
            </DialogTitle>
            <DialogDescription className="text-brand-muted">
              Enter your Vendor SKU and MPN / OEM number. If you do not have
              your own OEM, enter your brand and a competitor OEM instead.
            </DialogDescription>
          </DialogHeader>

          {dialogError ? (
            <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {dialogError}
            </p>
          ) : null}

          {!lookupResult ? (
            <form className="space-y-5" onSubmit={handleLookup}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lookup-sku">Vendor SKU</Label>
                  <Input id="lookup-sku" name="vendorSku" placeholder="BRK-001-BOSCH" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookup-part-number">MPN / OEM number</Label>
                  <Input id="lookup-part-number" name="partNumber" placeholder="90915-YZZD2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookup-brand">Brand Name</Label>
                  <Input id="lookup-brand" name="brand" placeholder="CEAT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookup-competitor-oem">Competitor OEM Part Number</Label>
                  <Input
                    id="lookup-competitor-oem"
                    name="competitorPartNumber"
                    placeholder="MRF-ZVTS-001"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lookup-competitor-brand">Competitor Brand Name</Label>
                  <Input
                    id="lookup-competitor-brand"
                    name="competitorBrandName"
                    placeholder="MRF"
                  />
                  <p className="text-xs text-brand-muted">
                    Use competitor OEM only when your own OEM field is blank.
                  </p>
                </div>
              </div>
              <DialogFooter className="mx-0 mb-0 rounded-sm border-border bg-transparent px-0 pb-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLookingUp}>
                  {isLookingUp ? "Checking..." : "Check Product"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleAddProduct}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  {lookupResult.exists ? "Existing master product" : "First vendor product"}
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {lookupResult.part?.partName ??
                    lookupResult.vin17Suggestion?.partName ??
                    "New product details required"}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  SKU {lookupIdentity.vendorSku} ·{" "}
                  {lookupIdentity.partNumber
                    ? `MPN / OEM ${lookupIdentity.partNumber}`
                    : `Brand ${lookupIdentity.brand} · Competitor OEM ${lookupIdentity.competitorPartNumber}`}
                </p>
              </div>

              {!lookupResult.exists && lookupResult.message ? (
                <p className="rounded-sm border border-brand-warning/20 bg-brand-warning/10 p-3 text-sm text-brand-muted">
                  {lookupResult.message}
                </p>
              ) : null}

              {!lookupResult.exists ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="partName">Product name</Label>
                    <Input
                      id="partName"
                      name="partName"
                      defaultValue={
                        lookupResult.part?.partName ??
                        lookupResult.vin17Suggestion?.partName ??
                        ""
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={
                        lookupResult.part?.category ??
                        lookupResult.vin17Suggestion?.category ??
                        ""
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeText">Badge text</Label>
                    <Input id="badgeText" name="badgeText" placeholder="Genuine quality" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="heading">Product heading</Label>
                    <Input id="heading" name="heading" placeholder="Reliable performance for every drive" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      className="min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                      placeholder="Complete product description"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="keyFeatures">Key features, one per line</Label>
                    <textarea
                      id="keyFeatures"
                      name="keyFeatures"
                      className="min-h-28 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                      placeholder={"OE-compatible fit\nLong service life\nTested materials"}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="images">Product images</Label>
                    <Input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      required
                    />
                    <p className="text-xs text-brand-muted">
                      At least one clear product image is required.
                    </p>
                    <ProductImageGuidelines />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={lookupResult.supplierOffer?.price ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={lookupResult.supplierOffer?.stock ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <div className="flex h-10 items-center rounded-sm border border-input bg-brand-surface px-3 text-sm font-semibold">
                    AED
                  </div>
                </div>
              </div>

              <DialogFooter className="mx-0 mb-0 rounded-sm border-border bg-transparent px-0 pb-0">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={resetAddProductFlow}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : lookupResult.supplierOffer
                      ? "Update Price & Quantity"
                      : "Add to Inventory"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <BulkImportDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        onProductsImported={() => {
          void loadProducts(1)
        }}
      />
    </div>
  )
}
