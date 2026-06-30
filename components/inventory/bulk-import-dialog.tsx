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
  Product,
  ProductBulkUploadSummary,
} from "./types"

type BulkImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsImported: (products: Product[]) => void
}

const productTemplate = [
  [
    "Platform Part number (SKU)",
    "Vendor SKU number",
    "OEM Part Number",
    "OEM Supersession Numbers",
    "Competitor Part Number",
    "Competitor Brand Name",
    "HS Code",
  ],
  [
    "",
    "BRK-001-BOSCH",
    "04465-YZZR7",
    "",
    "P83021",
    "Brembo",
    "",
  ],
  [
    "",
    "TY-BP-001",
    "04465-33471",
    "",
    "04465-06130",
    "TRW",
    "",
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
  summary: ProductBulkUploadSummary | ImageBulkUploadSummary,
): summary is ProductBulkUploadSummary => "mappedCount" in summary

export function BulkImportDialog({
  open,
  onOpenChange,
  onProductsImported,
}: BulkImportDialogProps) {
  const [mode, setMode] = useState<"products" | "images">("products")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<
    ProductBulkUploadSummary | ImageBulkUploadSummary | null
  >(null)

  const downloadUnmapped = (rows: BulkUnmappedRow[]) => {
    downloadCsv("unmapped-supplier-parts.csv", [
      [
        "Source Row",
        "Platform Part number (SKU)",
        "Vendor SKU number",
        "OEM Part Number",
        "Reason",
      ],
      ...rows.map((row) => [
        row.rowNumber,
        "",
        row.vendorSku,
        row.oemNumber ?? "",
        row.reason,
      ]),
    ])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const productFile = formData.get("productFile")
    const imageFile = formData.get("imageFile")
    const hasProductFile = productFile instanceof File && productFile.size > 0
    const hasImageFile = imageFile instanceof File && imageFile.size > 0
    const requestMode =
      mode === "images" || (!hasProductFile && hasImageFile)
        ? "images"
        : "products"

    if (requestMode === "products" && !hasProductFile) {
      setError("Select a product catalog file, or upload an image CSV for existing SKUs.")
      setSummary(null)
      return
    }
    if (requestMode === "images" && !hasImageFile) {
      setError("Select an image CSV or Excel file.")
      setSummary(null)
      return
    }

    formData.set("mode", requestMode)
    setIsUploading(true)
    setError(null)
    setSummary(null)

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
      const records = isProductSummary(payload.summary)
        ? payload.summary.mappedParts
        : payload.summary.updatedParts
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
            Only exact local or 17VIN OEM matches are added. Unconfirmed rows are
            returned without being saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => downloadCsv("supplier-products-template.csv", productTemplate)}
          >
            <Download />
            Product CSV template
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
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as "products" | "images")
            setError(null)
            setSummary(null)
          }}
        >
          <TabsList className="grid h-11 w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="images">Images only</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Product catalog file</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      Required only when importing products. To update images for
                      existing supplier SKUs, leave this empty and upload the
                      image file below. Product files require Vendor SKU number
                      and OEM Part Number; Platform SKU remains blank.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bulk-product-file">Product file</Label>
                  <Input
                    id="bulk-product-file"
                    name="productFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                  />
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
                {isUploading ? "Processing files..." : "Process import"}
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
                    ? `${summary.mappedCount} mapped (${summary.localMappedCount} local, ${summary.vin17MappedCount} through 17VIN); ${summary.unmappedCount} not mapped.`
                    : `${summary.updatedCount} products updated; ${summary.unmatchedCount} SKUs were not found.`}
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
