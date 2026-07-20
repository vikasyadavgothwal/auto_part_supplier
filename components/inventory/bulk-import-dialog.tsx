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
import { authenticatedFetch } from "@/lib/auth/client"
import { appBasePath } from "@/lib/routes"

import { mapSupplierPartToProduct } from "./mappers"
import type {
  BulkUploadResponse,
  Product,
  ProductBulkUploadSummary,
} from "./types"

type BulkImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsImported: (products: Product[]) => void
}

const downloadUnmapped = (base64: string) => {
  const bytes = Uint8Array.from(atob(base64), (character) =>
    character.charCodeAt(0),
  )
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = "unmapped-products.xlsx"
  link.click()
  URL.revokeObjectURL(url)
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onProductsImported,
}: BulkImportDialogProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ProductBulkUploadSummary | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const workbook = formData.get("workbookFile")
    if (!(workbook instanceof File) || workbook.size === 0) {
      setError("Select a completed Product Master XLSX workbook.")
      setSummary(null)
      return
    }

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
        throw new Error(payload.message ?? "Unable to process the workbook")
      }
      const nextSummary = payload.summary as ProductBulkUploadSummary
      setSummary(nextSummary)
      onProductsImported(
        nextSummary.mappedParts.map(mapSupplierPartToProduct),
      )
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to process the workbook",
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Product Master</DialogTitle>
          <DialogDescription>
            Use one workbook for products, mapping, fitment, pricing, stock,
            images, documents, bundles, shipping, and compliance data.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                Product Master XLSX template
              </p>
              <p className="mt-1 text-sm leading-6 text-brand-muted">
                Download the template, complete Product_Master, keep the lookup
                sheets in the workbook, and upload the same XLSX file here.
                Existing supplier SKUs update only your offer; new OEMs are
                checked against the catalog and VIN mapping flow.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <a
                  href={`${appBasePath}/templates/product-master-template.xlsx`}
                  download="product-master-template.xlsx"
                >
                  <Download />
                  Download dummy workbook
                </a>
              </Button>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="product-master-workbook">Product Master file</Label>
            <Input
              id="product-master-workbook"
              name="workbookFile"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
            />
          </div>
          <Button type="submit" disabled={isUploading} className="w-full">
            <Upload />
            {isUploading ? "Mapping products..." : "Upload and map workbook"}
          </Button>
        </form>

        {error ? (
          <div className="flex gap-3 rounded-sm border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <TriangleAlert className="size-5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        ) : null}

        {summary ? (
          <div className="space-y-3 rounded-sm border border-brand-success/20 bg-brand-success/10 p-4">
            <div className="flex items-start gap-3">
              <CircleCheck className="size-5 shrink-0 text-brand-success" />
              <div>
                <p className="font-semibold text-foreground">
                  Workbook processed
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  {summary.mappedCount} rows processed: {summary.localMappedCount}
                  {" "}matched locally, {summary.vin17MappedCount} matched through
                  VIN, {summary.unmappedCount} failed. Stock updated for{" "}
                  {summary.stockUpdatedCount ?? 0} rows and pricing updated for{" "}
                  {summary.pricingUpdatedCount ?? 0} rows.
                </p>
              </div>
            </div>
            {summary.unmapped.length && summary.unmappedWorkbookBase64 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  downloadUnmapped(summary.unmappedWorkbookBase64 as string)
                }
              >
                <Download />
                Download unmapped products (Excel)
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
