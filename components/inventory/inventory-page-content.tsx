"use client"

import { useState, type FormEvent } from "react"
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
  Product,
  SupplierPartCreateResponse,
  SupplierPartLookupResult,
} from "./types"

type InventoryPageContentProps = {
  initialProducts: Product[]
  loadError?: string | null
}

type Feedback = {
  tone: "success" | "error"
  title: string
  message: string
}

const defaultFeedback: Feedback | null = null

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export function InventoryPageContent({
  initialProducts,
  loadError = null,
}: InventoryPageContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupResult, setLookupResult] =
    useState<SupplierPartLookupResult | null>(null)
  const [lookupIdentity, setLookupIdentity] = useState({
    brand: "",
    mpn: "",
    oemNumber: "",
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

  function resetAddProductFlow() {
    setLookupResult(null)
    setLookupIdentity({ brand: "", mpn: "", oemNumber: "" })
    setDialogError(null)
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const brand = getFormValue(formData, "brand")
    const mpn = getFormValue(formData, "mpn")
    const oemNumber = getFormValue(formData, "oemNumber")
    setIsLookingUp(true)
    setDialogError(null)

    try {
      const response = await authenticatedFetch("/api/supplier/parts/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brand, mpn, oemNumber }),
      })
      const payload = (await response.json()) as {
        ok: boolean
        result?: SupplierPartLookupResult
        message?: string
      }
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Unable to check the product")
      }
      setLookupIdentity({ brand, mpn, oemNumber })
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

      const product = mapSupplierPartToProduct(payload.part)
      setProducts((currentProducts) => [
        product,
        ...currentProducts.filter(
          (currentProduct) => currentProduct.id !== product.id,
        ),
      ])
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

        <Card className="surface-card rounded-sm shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Product Mapping</CardTitle>
            <CardDescription className="text-brand-muted">
              Submitted parts are checked against the local master index first,
              then 17VIN when no local match exists.
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
              First identify the part by brand, MPN, and OEM. Existing products
              only need AED price and stock.
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lookup-brand">Brand</Label>
                  <Input id="lookup-brand" name="brand" placeholder="Toyota" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookup-mpn">MPN</Label>
                  <Input id="lookup-mpn" name="mpn" placeholder="90915-YZZD2" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookup-oem">OEM number</Label>
                  <Input id="lookup-oem" name="oemNumber" placeholder="90915-YZZD2" required />
                </div>
              </div>
              <DialogFooter className="mx-0 mb-0 rounded-sm border-border bg-brand-surface px-0 pb-0">
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
                  {lookupIdentity.brand} · MPN {lookupIdentity.mpn} · OEM {lookupIdentity.oemNumber}
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
                      At least one image is required. Maximum 8 images, 5 MB each.
                    </p>
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

              <DialogFooter className="mx-0 mb-0 rounded-sm border-border bg-brand-surface px-0 pb-0">
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
        onProductsImported={(importedProducts) => {
          setProducts((currentProducts) => {
            const importedById = new Map(
              importedProducts.map((product) => [product.id, product]),
            )
            return [
              ...importedProducts,
              ...currentProducts.filter(
                (product) => !importedById.has(product.id),
              ),
            ]
          })
        }}
      />
    </div>
  )
}
