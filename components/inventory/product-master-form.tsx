"use client"

import { useState, type FormEvent } from "react"
import { CircleCheck, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
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

import type {
  Product,
  SupplierPartCreateResponse,
  SupplierProductMasterPayload,
} from "./types"

type Field = { key: string; label?: string; type?: string; required?: boolean; wide?: boolean }
type Group = { title: string; description: string; fields: Field[] }

const groups: Group[] = [
  { title: "Product & catalog", description: "The same identity, category and brand fields used by Product Master.", fields: [
    { key: "SKU", required: true }, { key: "Product Name", required: true },
    { key: "Short Description", wide: true }, { key: "Long Description", type: "textarea", wide: true },
    { key: "Manufacturer Part Number (MPN)" }, { key: "Status" }, { key: "Grade" }, { key: "Condition" },
    { key: "Category ID" }, { key: "Category Name", required: true }, { key: "Parent Category" },
    { key: "Brand ID" }, { key: "Brand Name", required: true }, { key: "Product Categories", wide: true }, { key: "Tier 1" },
  ]},
  { title: "Attributes & vehicle fitment", description: "Describe the product and the exact vehicle application.", fields: [
    { key: "Attribute Name" }, { key: "Attribute Value" }, { key: "Detailed Attributes", type: "textarea", wide: true },
    { key: "Attribute Name (B)" }, { key: "Attribute Name (C)" }, { key: "Vehicle ID" },
    { key: "Vehicle Fitment | Make" }, { key: "Vehicle Fitment | Model" },
    { key: "Vehicle Fitment | Year_Start", type: "number" }, { key: "Vehicle Fitment | Year_End", type: "number" },
    { key: "Vehicle Fitment | Engine" }, { key: "Vehicle Fitment | Trim" }, { key: "Vehicle Fitment | Drive_Type" },
    { key: "Vehicle Fitment | Fitment Notes", type: "textarea", wide: true },
  ]},
  { title: "Pricing & inventory", description: "AED pricing and the warehouse stock row used for marketplace availability.", fields: [
    { key: "Product Pricing | Base Price (AED)", type: "number", required: true },
    { key: "Product Pricing | Discount Price (AED)", type: "number" }, { key: "Product Pricing | Currency", required: true },
    { key: "Product Pricing | Tax Class" }, { key: "Product Pricing | VAT" },
    { key: "Product Pricing | Max Retail Price", type: "number" },
    { key: "Product Pricing | Wholesale/Distributor Pricing", type: "number" }, { key: "Product Pricing | Fleet Pricing", type: "number" },
    { key: "Product Inventory | Warehouse ID", required: true }, { key: "Product Inventory | Quantity", type: "number", required: true },
    { key: "Product Inventory | Lead Time" }, { key: "Product Inventory | Low Stock Threshold", type: "number" },
  ]},
  { title: "Media, documents & references", description: "Images are copied to managed storage; OEM or competitor data drives mapping.", fields: [
    { key: "Product Images | Primary Image URL", type: "url", wide: true }, { key: "Product Images | Gallery Image URLs", type: "textarea", wide: true },
    { key: "Product Documents | Document Type" }, { key: "Product Documents | Document URL", type: "url" },
    { key: "Cross References | OEM Part Number" }, { key: "Cross References | OEM Supersession Numbers", wide: true },
    { key: "Cross References | Competitor Part Number" }, { key: "Cross References | Competitor Brand Name" },
    { key: "Cross References | HS Code" },
  ]},
  { title: "Bundles, shipping & compliance", description: "Optional bundle, logistics, warranty and certification information.", fields: [
    { key: "Product Bundles | Component SKU" }, { key: "Product Bundles | Quantity in Bundle", type: "number" },
    { key: "Product Bundles | Parent Bundle SKU" }, { key: "Product Bundles | Quantity as Component", type: "number" },
    { key: "Shipping Logistics | Weight (kg)", type: "number" }, { key: "Shipping Logistics | Length (cm)", type: "number" },
    { key: "Shipping Logistics | Width (cm)", type: "number" }, { key: "Shipping Logistics | Height (cm)", type: "number" },
    { key: "Shipping Logistics | HS Code" }, { key: "Shipping Logistics | Country of Origin" },
    { key: "Compliance | Warranty Period (Months)", type: "number" }, { key: "Compliance | Certification (e.g., ESMA)" },
  ]},
]

const list = (value: string) => value.split(/[,;|\n]+/).map((item) => item.trim()).filter(Boolean)
const bool = (value: string, fallback: boolean) => value ? value.toLowerCase() !== "no" : fallback
const rawObject = (product?: Product | null) =>
  product?.rawUploadData && typeof product.rawUploadData === "object" && !Array.isArray(product.rawUploadData)
    ? product.rawUploadData as Record<string, unknown> : {}

export function ProductMasterForm({ open, onOpenChange, product, onSaved }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSaved: (part: NonNullable<SupplierPartCreateResponse["part"]>, message: string) => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const raw = rawObject(product)
  const value = (key: string, fallback = "") => Object.prototype.hasOwnProperty.call(raw, key) ? String(raw[key] ?? "") : fallback
  const fallback: Record<string, string> = {
    SKU: product?.vendorSku ?? "", "Product Name": product?.productName ?? "",
    "Manufacturer Part Number (MPN)": product?.partNumber ?? "", "Category Name": product?.category ?? "",
    "Brand Name": product?.brand === "Unbranded" ? "" : product?.brand ?? "",
    "Product Pricing | Base Price (AED)": product ? String(product.priceValue) : "",
    "Product Pricing | Currency": "AED", "Product Inventory | Quantity": product ? String(product.stock) : "",
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const get = (key: string) => String(data.get(key) ?? "").trim()
    setIsSaving(true); setError("")
    try {
      let storedUrls = product?.imageUrls ?? []
      const files = data.getAll("imageFiles").filter((item): item is File => item instanceof File && item.size > 0)
      if (files.length) {
        const upload = new FormData(); files.forEach((file) => upload.append("images", file))
        const response = await authenticatedFetch("/api/supplier/parts/images", { method: "POST", body: upload })
        const result = await response.json() as { ok: boolean; images?: Array<{url:string}>; message?: string }
        if (!response.ok || !result.ok) throw new Error(result.message ?? "Unable to upload images")
        storedUrls = result.images?.map((image) => image.url) ?? storedUrls
      }
      const payload: SupplierProductMasterPayload = {
        mode: "product_master_form",
        identity: { sku:get("SKU"), productName:get("Product Name"), shortDescription:get("Short Description"), longDescription:get("Long Description"), mpn:get("Manufacturer Part Number (MPN)"), status:get("Status"), grade:get("Grade"), condition:get("Condition") },
        category: { id:get("Category ID"), name:get("Category Name"), parentId:get("Parent Category") },
        brand: { id:get("Brand ID"), name:get("Brand Name"), productCategories:list(get("Product Categories")), tier:get("Tier 1") },
        attributes: { name:get("Attribute Name"), value:get("Attribute Value"), detailed:get("Detailed Attributes"), nameB:get("Attribute Name (B)"), nameC:get("Attribute Name (C)") },
        vehicle: { id:get("Vehicle ID"), make:get("Vehicle Fitment | Make"), model:get("Vehicle Fitment | Model"), yearStart:get("Vehicle Fitment | Year_Start"), yearEnd:get("Vehicle Fitment | Year_End"), engine:get("Vehicle Fitment | Engine"), trim:get("Vehicle Fitment | Trim"), driveType:get("Vehicle Fitment | Drive_Type"), notes:get("Vehicle Fitment | Fitment Notes") },
        pricing: { basePrice:get("Product Pricing | Base Price (AED)"), discountPrice:get("Product Pricing | Discount Price (AED)"), currency:get("Product Pricing | Currency") || "AED", taxClass:get("Product Pricing | Tax Class"), vat:get("Product Pricing | VAT"), maxRetailPrice:get("Product Pricing | Max Retail Price"), wholesaleDistributorPrice:get("Product Pricing | Wholesale/Distributor Pricing"), fleetPrice:get("Product Pricing | Fleet Pricing") },
        inventory: { warehouseId:get("Product Inventory | Warehouse ID"), quantity:get("Product Inventory | Quantity"), leadTime:get("Product Inventory | Lead Time"), lowStockThreshold:get("Product Inventory | Low Stock Threshold") },
        images: { primaryUrl:get("Product Images | Primary Image URL"), galleryUrls:list(get("Product Images | Gallery Image URLs")), storedUrls },
        document: { type:get("Product Documents | Document Type"), url:get("Product Documents | Document URL") },
        crossReferences: { oemNumber:get("Cross References | OEM Part Number"), oemSupersessionNumbers:list(get("Cross References | OEM Supersession Numbers")), competitorPartNumber:get("Cross References | Competitor Part Number"), competitorBrandName:get("Cross References | Competitor Brand Name"), hsCode:get("Cross References | HS Code") },
        bundle: { componentSku:get("Product Bundles | Component SKU"), quantityInBundle:get("Product Bundles | Quantity in Bundle"), parentBundleSku:get("Product Bundles | Parent Bundle SKU"), quantityAsComponent:get("Product Bundles | Quantity as Component") },
        shipping: { weightKg:get("Shipping Logistics | Weight (kg)"), lengthCm:get("Shipping Logistics | Length (cm)"), widthCm:get("Shipping Logistics | Width (cm)"), heightCm:get("Shipping Logistics | Height (cm)"), hsCode:get("Shipping Logistics | HS Code"), countryOfOrigin:get("Shipping Logistics | Country of Origin") },
        compliance: { warrantyMonths:get("Compliance | Warranty Period (Months)"), certification:get("Compliance | Certification (e.g., ESMA)") },
        marketplace: { allowBackorders:bool(get("Marketplace Settings | Allow Backorders (Yes/No)"), false), maxOrderQuantity:get("Marketplace Settings | Max Order Quantity"), isActive:bool(get("Marketplace Settings | Is Active (Yes/No)"), true) },
      }
      const response = await authenticatedFetch(product?.id ? `/api/supplier/parts/${product.id}` : "/api/supplier/parts", { method: product?.id ? "PATCH" : "POST", headers:{"content-type":"application/json"}, body:JSON.stringify(payload) })
      const result = await response.json() as SupplierPartCreateResponse
      if (!response.ok || !result.ok || !result.part) throw new Error(result.message ?? "Unable to save product")
      onSaved(result.part, result.part.mappingStatus === "mapped" ? "Product saved and mapped successfully." : "Product saved for review because no exact local or 17VIN match was found.")
      onOpenChange(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save product") }
    finally { setIsSaving(false) }
  }

  return <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
    <DialogContent className="max-h-[94vh] overflow-hidden rounded-sm bg-brand-panel p-0 sm:max-w-5xl">
      <DialogHeader className="border-b border-border px-5 py-4 sm:px-7">
        <DialogTitle>{product ? "Edit Product Master" : "Add Single Product"}</DialogTitle>
        <DialogDescription>Enter the same information available in the Product Master Excel. Mapping-sensitive changes are checked again automatically.</DialogDescription>
      </DialogHeader>
      <form className="flex min-h-0 flex-col" onSubmit={submit}>
        <div className="max-h-[72vh] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          {error ? <div className="flex gap-2 rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><TriangleAlert className="size-4 shrink-0" />{error}</div> : null}
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 text-sm text-brand-muted">
            <p className="flex items-center gap-2 font-semibold text-foreground"><CircleCheck className="size-4 text-primary" />Automatic product mapping</p>
            {/* <p className="mt-1">The system checks the local master database first, then 17VIN. If OEM is blank, supplier brand plus competitor part and brand are used.</p> */}
          </div>
          {groups.map((group) => <section key={group.title} className="rounded-sm border border-border bg-brand-surface p-4 sm:p-5">
            <h3 className="font-semibold text-foreground">{group.title}</h3><p className="mt-1 text-xs text-brand-muted">{group.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.fields.map((field) => <div key={field.key} className={`min-w-0 space-y-2 ${field.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                <Label htmlFor={`pm-${field.key}`}>{field.label ?? field.key}{field.required ? " *" : ""}</Label>
                {field.type === "textarea" ? <textarea id={`pm-${field.key}`} name={field.key} defaultValue={value(field.key, fallback[field.key])} className="min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" /> : <Input id={`pm-${field.key}`} name={field.key} type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "any" : undefined} required={field.required} defaultValue={value(field.key, fallback[field.key])} />}
              </div>)}
            </div>
          </section>)}
          <section className="rounded-sm border border-border bg-brand-surface p-4 sm:p-5"><h3 className="font-semibold">Marketplace settings & image upload</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["Marketplace Settings | Allow Backorders (Yes/No)","Marketplace Settings | Max Order Quantity","Marketplace Settings | Is Active (Yes/No)"].map((key) => <div key={key} className="space-y-2"><Label htmlFor={`pm-${key}`}>{key}</Label><Input id={`pm-${key}`} name={key} defaultValue={value(key, key.includes("Is Active") ? "Yes" : key.includes("Backorders") ? "No" : "")} /></div>)}
              <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label htmlFor="pm-images">Upload product images</Label><Input id="pm-images" name="imageFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple /><p className="text-xs text-brand-muted">Optional. JPG, PNG or WebP; maximum 8 files and 5 MB each.</p></div>
            </div>
          </section>
          <div className="rounded-sm border border-border p-4 text-xs text-brand-muted"><strong className="text-foreground">System-managed fields:</strong> Platform Part Number, validation status and missing-field result are assigned after mapping and cannot be edited.</div>
        </div>
        <DialogFooter className="m-0 border-t border-border bg-brand-panel px-5 py-4 sm:px-7"><Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Saving & mapping..." : product ? "Save all changes" : "Add product"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
