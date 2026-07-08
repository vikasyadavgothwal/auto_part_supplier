"use client"

import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  Download,
  FileSpreadsheet,
  TriangleAlert,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { authenticatedFetch } from "@/lib/auth/client"

import { mapSupplierPartToProduct } from "./mappers"
import type {
  BulkUnmappedRow,
  BulkUploadResponse,
  ImageBulkUploadSummary,
  PricingBulkUpdateSummary,
  Product,
  ProductBulkUploadSummary,
  StockBulkUpdateSummary,
} from "./types"

type BulkImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsImported: (products: Product[]) => void
}

type BulkUploadMode = NonNullable<BulkUploadResponse["mode"]>

const productTemplate = [
  [
    "SKU",
    "Product Name",
    "Short Description",
    "Long Description",
    "Manufacturer Part Number (MPN)",
    "Status",
    "Grade",
    "Condition",
    "Price",
    "Stock",
  ],
  [
    "BRK-001-BOSCH",
    "Bosch Premium Ceramic Brake Pads",
    "Premium Ceramic Brake Pads",
    "High-performance ceramic brake pads offering superior stopping power, low dust, and noise reduction.",
    "986494118",
    "Active",
    "Premium",
    "New",
    150,
    50,
  ],
  [
    "TY-BP-001",
    "Front Brake Pad Set",
    "Premium ceramic front brake pad set for Toyota Camry",
    "Premium ceramic front brake pad set for Toyota Camry",
    "SN134",
    "Active",
    "OEM Equivalent",
    "New",
    185,
    35,
  ],
]

const imageTemplate = [
  ["Vendor SKU number", "Primary Image URL", "Gallery Image URLs"],
  [
    "BRK-001-BOSCH",
    "https://example.com/images/BRK-001-main.jpg",
    "https://example.com/images/BRK-001-side.jpg; https://example.com/images/BRK-001-back.jpg",
  ],
]

const imageQualityGuidelines = [
  "Use direct public JPG, PNG, or WebP image URLs. The URL must open the image itself, not a webpage.",
  "Maximum file size is 5 MB per image. Recommended quality is 1200 × 1200 px or higher.",
  "Use clear, sharp, well-lit product photos on a plain or white background.",
  "Show the full part in frame. Avoid blurry images, screenshots, watermarks, borders, and supplier logos.",
  "Use the best front/product view as Primary Image. Add up to 5 gallery images for other angles.",
]

const stockTemplate = [
  ["SKU", "Warehouse ID", "Quantity", "Lead Time", "Low Stock Threshold"],
  ["BRK-001-BOSCH", "DXB-WH-01", 50, "2 days", 10],
  ["TY-BP-001", "Dubai Investment Park", 35, "Same day", 1],
]

const pricingTemplate = [
  [
    "SKU",
    "Base Price (AED)",
    "Discount Price (AED)",
    "Currency",
    "Tax Class",
    "VAT",
    "Max Retail Price",
    "Wholesale/Distributor Pricing",
    "Fleet Pricing",
  ],
  [
    "BRK-001-BOSCH",
    150,
    135,
    "AED",
    "Standard 5%",
    "Included",
    "180.00",
    "120.00",
    "110.00",
  ],
  [
    "TY-BP-001",
    185,
    "",
    "AED",
    "",
    "Not Included",
    220,
    120,
    "",
  ],
]

const escapeCsvCell = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`

const downloadCsv = (
  filename: string,
  rows: Array<Array<string | number>>,
) => {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const isProductSummary = (
  summary:
    | ProductBulkUploadSummary
    | ImageBulkUploadSummary
    | StockBulkUpdateSummary
    | PricingBulkUpdateSummary,
): summary is ProductBulkUploadSummary => "mappedCount" in summary

const isUpdateSummary = (
  summary:
    | ProductBulkUploadSummary
    | ImageBulkUploadSummary
    | StockBulkUpdateSummary
    | PricingBulkUpdateSummary,
): summary is
  | ImageBulkUploadSummary
  | StockBulkUpdateSummary
  | PricingBulkUpdateSummary => "updatedCount" in summary

const getUpdateSummaryLabel = (mode: BulkUploadMode | null) => {
  if (mode === "stock") {
    return "stock rows updated"
  }
  if (mode === "pricing") {
    return "prices updated"
  }
  if (mode === "images") {
    return "image rows updated"
  }
  return "products updated"
}

const getProductInfoSummaryText = (summary: ProductBulkUploadSummary) =>
  `${summary.mappedCount} product info rows updated; ${summary.unmappedCount} failed.`

function ImageQualityGuidelines() {
  return (
    <div className="mt-3 rounded-sm border border-primary/20 bg-primary/5 p-3">
      <p className="text-xs font-semibold text-foreground">
        Image quality requirements
      </p>
      <ul className="mt-2 space-y-1 text-xs text-brand-muted">
        {imageQualityGuidelines.map((guideline) => (
          <li key={guideline} className="flex gap-2">
            <CircleCheck className="mt-0.5 size-3 shrink-0 text-primary" />
            <span>{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onProductsImported,
}: BulkImportDialogProps) {
  const [mode, setMode] =
    useState<"products" | "images" | "stock" | "pricing">("products")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<
    | ProductBulkUploadSummary
    | ImageBulkUploadSummary
    | StockBulkUpdateSummary
    | PricingBulkUpdateSummary
    | null
  >(null)
  const [summaryMode, setSummaryMode] = useState<BulkUploadMode | null>(null)

  const downloadUnmapped = (rows: BulkUnmappedRow[]) => {
    downloadCsv("unmapped-supplier-parts.csv", [
      [
        "Source Row",
        "SKU",
        "Manufacturer Part Number (MPN)",
        "Brand Name",
        "Competitor OEM Part Number",
        "Reason",
      ],
      ...rows.map((row) => [
        row.rowNumber,
        row.vendorSku,
        row.oemNumber ?? "",
        row.brand ?? "",
        row.competitorPartNumber ?? "",
        row.reason,
      ]),
    ])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const productFile = formData.get("productFile")
    const imageFile = formData.get("imageFile")
    const stockFile = formData.get("stockFile")
    const pricingFile = formData.get("pricingFile")
    const hasProductFile = productFile instanceof File && productFile.size > 0
    const hasImageFile = imageFile instanceof File && imageFile.size > 0
    const hasStockFile = stockFile instanceof File && stockFile.size > 0
    const hasPricingFile = pricingFile instanceof File && pricingFile.size > 0
    const requestMode =
      mode === "products" && !hasProductFile && hasImageFile
        ? "images"
        : mode

    if (requestMode === "products" && !hasProductFile) {
      setError("Select a product catalog file, or upload an image CSV for existing SKUs.")
      setSummary(null)
      setSummaryMode(null)
      return
    }
    if (requestMode === "images" && !hasImageFile) {
      setError("Select an image CSV or Excel file.")
      setSummary(null)
      setSummaryMode(null)
      return
    }
    if (requestMode === "stock" && !hasStockFile) {
      setError("Select a stock CSV or Excel file.")
      setSummary(null)
      setSummaryMode(null)
      return
    }
    if (requestMode === "pricing" && !hasPricingFile) {
      setError("Select a pricing CSV or Excel file.")
      setSummary(null)
      setSummaryMode(null)
      return
    }

    formData.set("mode", requestMode)
    setIsUploading(true)
    setError(null)
    setSummary(null)
    setSummaryMode(null)

    try {
      const response = await authenticatedFetch(
        "/api/supplier/parts/bulk-upload",
        { method: "POST", body: formData },
      )
      const payload = (await response.json()) as BulkUploadResponse
      if (!response.ok || !payload.ok || !payload.summary) {
        throw new Error(payload.message ?? "Unable to process the upload")
      }

      setSummary(payload.summary)
      setSummaryMode(payload.mode ?? requestMode)
      const records = isProductSummary(payload.summary)
        ? payload.summary.mappedParts
        : isUpdateSummary(payload.summary)
          ? payload.summary.updatedParts
          : []
      onProductsImported(records.map(mapSupplierPartToProduct))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to process the upload",
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk inventory import</DialogTitle>
          <DialogDescription>
            Import products, images, stock quantities, or pricing by this
            supplier&apos;s Vendor SKU.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => downloadCsv("supplier-product-info-template.csv", productTemplate)}
          >
            <Download />
            Product info CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => downloadCsv("supplier-images-template.csv", imageTemplate)}
          >
            <Download />
            Image CSV template
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => downloadCsv("supplier-stock-template.csv", stockTemplate)}
          >
            <Download />
            Stock CSV template
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => downloadCsv("supplier-pricing-template.csv", pricingTemplate)}
          >
            <Download />
            Pricing CSV template
          </Button>
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as "products" | "images" | "stock" | "pricing")
            setError(null)
            setSummary(null)
            setSummaryMode(null)
          }}
        >
          <TabsList className="grid h-11 w-full grid-cols-4">
            <TabsTrigger value="products">Product info</TabsTrigger>
            <TabsTrigger value="images">Images only</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Add or update product information</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      Upload supplier product info by SKU. Existing SKUs are
                      updated; new SKUs are added as pending review. Required
                      columns are SKU, Product Name, and Manufacturer Part
                      Number (MPN). Status, Grade, Condition, Price, and Stock
                      are also accepted.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="bulk-product-file">Product info file</Label>
                    <Input
                      id="bulk-product-file"
                      name="productFile"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadCsv("supplier-product-info-template.csv", productTemplate)}
                  >
                    <Download />
                    Download dummy CSV
                  </Button>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="font-semibold">Image mapping file (optional)</p>
                <p className="mt-1 text-xs text-brand-muted">
                  Images are matched using this supplier&apos;s Vendor SKU number.
                  Use one Primary Image URL and place remaining URLs in Gallery
                  Image URLs, separated by semicolons. Gallery Image 1 through 5
                  columns are also accepted.
                </p>
                <ImageQualityGuidelines />
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bulk-product-images">Image file</Label>
                  <Input
                    id="bulk-product-images"
                    name="imageFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                <Upload />
                {isUploading ? "Updating product info..." : "Add / update product info"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="images" className="pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="font-semibold">Update images by supplier SKU</p>
                <p className="mt-1 text-xs text-brand-muted">
                  This updates only your mapped products. Another supplier using
                  the same SKU is not affected. Primary Image URL is separate;
                  gallery URLs can use one semicolon-separated column or Gallery
                  Image 1 through 5 columns.
                </p>
                <ImageQualityGuidelines />
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bulk-image-file">Image file</Label>
                  <Input
                    id="bulk-image-file"
                    name="imageFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                <Upload />
                {isUploading ? "Updating images..." : "Upload images"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="stock" className="pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="font-semibold">Update stock by supplier SKU</p>
                <p className="mt-1 text-xs text-brand-muted">
                  Use SKU, Warehouse ID, Quantity, Lead Time, and Low Stock
                  Threshold columns. Quantities are stored per warehouse and the
                  product&apos;s total stock is recalculated automatically.
                </p>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bulk-stock-file">Stock file</Label>
                  <Input
                    id="bulk-stock-file"
                    name="stockFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                <Upload />
                {isUploading ? "Updating stock..." : "Upload stock"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="pricing" className="pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="font-semibold">Update pricing by supplier SKU</p>
                <p className="mt-1 text-xs text-brand-muted">
                  Use SKU, Base Price, Discount Price, Currency, Tax Class,
                  VAT, Max Retail Price, Wholesale/Distributor Pricing, and
                  Fleet Pricing columns. Discount Price is used as the active
                  inventory price when present.
                </p>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bulk-pricing-file">Pricing file</Label>
                  <Input
                    id="bulk-pricing-file"
                    name="pricingFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                <Upload />
                {isUploading ? "Updating pricing..." : "Upload pricing"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error ? (
          <div className="flex gap-3 rounded-sm border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <TriangleAlert className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {summary ? (
          <div className="space-y-4 rounded-sm border border-brand-success/20 bg-brand-success/10 p-4">
            <div className="flex items-start gap-3">
              <CircleCheck className="size-5 shrink-0 text-brand-success" />
              <div>
                <p className="font-semibold text-foreground">Upload processed</p>
                <p className="mt-1 text-sm text-brand-muted">
                  {isProductSummary(summary)
                    ? getProductInfoSummaryText(summary)
                    : `${summary.updatedCount} ${getUpdateSummaryLabel(summaryMode)}; ${summary.unmatchedCount} SKUs were not found.`}
                </p>
              </div>
            </div>

            {(isProductSummary(summary)
              ? summary.unmapped.length
              : summary.unmatched.length) > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  downloadUnmapped(
                    isProductSummary(summary)
                      ? summary.unmapped
                      : summary.unmatched,
                  )
                }
              >
                <Download />
                Download unmapped list
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
