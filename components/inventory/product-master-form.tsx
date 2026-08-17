"use client"

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react"
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
type ProductMasterLookups = {
  categories: Array<{ id: string; name: string; parentId: string | null; parentName: string | null }>
  brands: Array<{ id: string; name: string; tier: string | null; categories: Array<{ id: string; name: string }> }>
}

const groups: Group[] = [
  { title: "Product & catalog", description: "The same identity, category and brand fields used by Product Master.", fields: [
    { key: "SKU", required: true }, { key: "Product Name", required: true },
    { key: "Short Description", wide: true }, { key: "Long Description", type: "textarea", wide: true },
    { key: "Manufacturer Part Number (MPN)", required: true }, { key: "Status" }, { key: "Grade" }, { key: "Condition" },
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

const readJsonResponse = async <T,>(response: Response, fallbackMessage: string) => {
  const text = await response.text()
  if (!text) throw new Error(fallbackMessage)
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(response.ok ? fallbackMessage : text)
  }
}

const requiredFields = groups.flatMap((group) =>
  group.fields.filter((field) => field.required).map((field) => field.key),
).concat(["Category Name", "Brand Name"])

const numberFields = new Set(
  groups.flatMap((group) =>
    group.fields.filter((field) => field.type === "number").map((field) => field.key),
  ),
)
const integerFields = new Set([
  "Vehicle Fitment | Year_Start",
  "Vehicle Fitment | Year_End",
  "Product Inventory | Quantity",
  "Product Inventory | Low Stock Threshold",
  "Product Bundles | Quantity in Bundle",
  "Product Bundles | Quantity as Component",
  "Compliance | Warranty Period (Months)",
  "Marketplace Settings | Max Order Quantity",
])
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maxImageSize = 5 * 1024 * 1024
const maxImageFiles = 8

const validateUrl = (value: string, label: string) => {
  if (!value) return ""
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? ""
      : `${label} must be a valid http or https URL`
  } catch {
    return `${label} must be a valid URL`
  }
}

const validateFormData = (data: FormData) => {
  const get = (key: string) => String(data.get(key) ?? "").trim()
  for (const key of requiredFields) {
    if (!get(key)) return `${key} is required`
  }
  for (const key of numberFields) {
    const value = get(key)
    if (!value) continue
    const number = Number(value)
    if (!Number.isFinite(number) || number < 0) {
      return `${key} must be a valid non-negative number`
    }
    if (integerFields.has(key) && !Number.isInteger(number)) {
      return `${key} must be a whole number`
    }
  }
  const basePrice = Number(get("Product Pricing | Base Price (AED)"))
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return "Product Pricing | Base Price (AED) must be greater than 0"
  }
  const quantity = Number(get("Product Inventory | Quantity"))
  if (!Number.isInteger(quantity) || quantity < 0) {
    return "Product Inventory | Quantity must be a whole number"
  }
  const maxOrderQuantity = get("Marketplace Settings | Max Order Quantity")
  if (maxOrderQuantity) {
    const maxOrderQuantityNumber = Number(maxOrderQuantity)
    if (!Number.isInteger(maxOrderQuantityNumber) || maxOrderQuantityNumber < 0) {
      return "Marketplace Settings | Max Order Quantity must be a whole number"
    }
  }
  const yearStart = get("Vehicle Fitment | Year_Start")
  const yearEnd = get("Vehicle Fitment | Year_End")
  if (yearStart && yearEnd && Number(yearEnd) < Number(yearStart)) {
    return "Vehicle Fitment | Year_End must be after Year_Start"
  }
  const primaryUrlError = validateUrl(
    get("Product Images | Primary Image URL"),
    "Product Images | Primary Image URL",
  )
  if (primaryUrlError) return primaryUrlError
  const documentUrlError = validateUrl(
    get("Product Documents | Document URL"),
    "Product Documents | Document URL",
  )
  if (documentUrlError) return documentUrlError
  const galleryUrls = list(get("Product Images | Gallery Image URLs"))
  for (const url of galleryUrls) {
    const galleryUrlError = validateUrl(url, "Product Images | Gallery Image URLs")
    if (galleryUrlError) return galleryUrlError
  }
  return ""
}

const validateImageFiles = (files: File[]) => {
  if (files.length > maxImageFiles) return `Upload no more than ${maxImageFiles} product images`
  for (const file of files) {
    if (!imageTypes.has(file.type)) return "Images must be JPG, PNG, or WebP"
    if (file.size > maxImageSize) return "Each product image must be 5 MB or smaller"
  }
  return ""
}

const preventInvalidNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
  if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault()
}
const fieldPlaceholder = (key: string) => {
  if (key === "SKU") return "Enter vendor SKU"
  if (key === "Product Name") return "Enter product name"
  if (key === "Manufacturer Part Number (MPN)") return "Enter manufacturer part number"
  if (key.includes("URL")) return "https://example.com/file"
  if (key.includes("Quantity") || key.includes("Stock") || key.includes("Year") || key.includes("Months")) return "0"
  if (key.includes("Price") || key.includes("VAT") || key.includes("Weight") || key.includes("Length") || key.includes("Width") || key.includes("Height")) return "0.00"
  return `Enter ${key.toLowerCase()}`
}
const selectClassName = "h-10 w-full rounded-sm border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"

export function ProductMasterForm({ open, onOpenChange, product, onSaved }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSaved: (part: NonNullable<SupplierPartCreateResponse["part"]>, message: string) => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [lookups, setLookups] = useState<ProductMasterLookups>({ categories: [], brands: [] })
  const [lookupError, setLookupError] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("")
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const raw = rawObject(product)
  const value = (key: string, fallback = "") => Object.prototype.hasOwnProperty.call(raw, key) ? String(raw[key] ?? "") : fallback
  const fallback: Record<string, string> = {
    SKU: product?.vendorSku ?? "", "Product Name": product?.productName ?? "",
    "Manufacturer Part Number (MPN)": product?.partNumber ?? "", "Category Name": product?.category ?? "",
    "Brand Name": product?.brand === "Unbranded" ? "" : product?.brand ?? "",
    "Product Pricing | Base Price (AED)": product ? String(product.priceValue) : "",
    "Product Pricing | Currency": "AED", "Product Inventory | Quantity": product ? String(product.stock) : "",
  }
  const selectedCategory = lookups.categories.find((category) => category.id === selectedCategoryId) ?? null
  const selectedParentCategory = lookups.categories.find((category) => category.id === selectedParentCategoryId) ?? null
  const selectedBrand = lookups.brands.find((brand) => brand.id === selectedBrandId) ?? null
  const brandCategoryNames = useMemo(() => selectedBrand?.categories.map((category) => category.name) ?? [], [selectedBrand])

  useEffect(() => {
    if (!open) return
    let ignore = false
    const loadLookups = async () => {
      try {
        const response = await authenticatedFetch("/api/supplier/parts/product-master-lookups")
        const payload = await readJsonResponse<{ ok?: boolean; message?: string } & ProductMasterLookups>(response, "Unable to load product lookups")
        if (ignore) return
        if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Unable to load product lookups")
        const nextLookups = { categories: payload.categories ?? [], brands: payload.brands ?? [] }
        setLookups(nextLookups)
        const currentRaw = rawObject(product)
        const currentValue = (key: string, fallbackValue = "") =>
          Object.prototype.hasOwnProperty.call(currentRaw, key) ? String(currentRaw[key] ?? "") : fallbackValue
        const currentCategoryName = currentValue("Category Name", product?.category ?? "").toLowerCase()
        const currentParentValue = currentValue("Parent Category").toLowerCase()
        const currentBrandName = currentValue("Brand Name", product?.brand === "Unbranded" ? "" : product?.brand ?? "").toLowerCase()
        const category = nextLookups.categories.find((item) => item.name.toLowerCase() === currentCategoryName)
        const parent = nextLookups.categories.find((item) => item.id.toLowerCase() === currentParentValue || item.name.toLowerCase() === currentParentValue)
        const brand = nextLookups.brands.find((item) => item.name.toLowerCase() === currentBrandName)
        setSelectedCategoryId(category?.id ?? "")
        setSelectedParentCategoryId(parent?.id ?? category?.parentId ?? "")
        setSelectedBrandId(brand?.id ?? "")
        setLookupError("")
      } catch (cause) {
        if (!ignore) setLookupError(cause instanceof Error ? cause.message : "Unable to load product lookups")
      }
    }
    void loadLookups()
    return () => {
      ignore = true
    }
  }, [open, product])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    const category = lookups.categories.find((item) => item.id === categoryId)
    setSelectedParentCategoryId(category?.parentId ?? "")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const get = (key: string) => String(data.get(key) ?? "").trim()
    const validationError = validateFormData(data)
    if (validationError) {
      setError(validationError)
      return
    }
    setIsSaving(true); setError("")
    try {
      let storedUrls = product?.imageUrls ?? []
      const files = data.getAll("imageFiles").filter((item): item is File => item instanceof File && item.size > 0)
      if (files.length) {
        const fileError = validateImageFiles(files)
        if (fileError) throw new Error(fileError)
        const upload = new FormData(); files.forEach((file) => upload.append("images", file))
        const response = await authenticatedFetch("/api/supplier/parts/images", { method: "POST", body: upload })
        const result = await readJsonResponse<{ ok: boolean; images?: Array<{url:string}>; message?: string }>(response, "Unable to upload images")
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
      const result = await readJsonResponse<SupplierPartCreateResponse>(response, "Unable to save product")
      if (!response.ok || !result.ok || !result.part) throw new Error(result.message ?? "Unable to save product")
      const message = result.part.mappingStatus === "mapped" ? "Product saved and mapped successfully." : "Product saved for review because no exact local or 17VIN match was found."
      onSaved(result.part, message)
      onOpenChange(false)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to save product"
      setError(message)
    }
    finally { setIsSaving(false) }
  }

  return <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
    <DialogContent className="max-h-[94vh] overflow-hidden rounded-sm bg-brand-panel p-0 sm:max-w-5xl">
      <DialogHeader className="border-b border-border px-5 py-4 sm:px-7">
        <DialogTitle>{product ? "Edit Product Master" : "Add Single Product"}</DialogTitle>
        <DialogDescription>Enter the same information available in the Product Master Excel. Mapping-sensitive changes are checked again automatically.</DialogDescription>
      </DialogHeader>
      <form className="flex min-h-0 flex-col" onSubmit={submit} noValidate>
        <div className="max-h-[72vh] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          {error ? <div className="flex gap-2 rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><TriangleAlert className="size-4 shrink-0" />{error}</div> : null}
          {lookupError ? <div className="flex gap-2 rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><TriangleAlert className="size-4 shrink-0" />{lookupError}</div> : null}
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 text-sm text-brand-muted">
            <p className="flex items-center gap-2 font-semibold text-foreground"><CircleCheck className="size-4 text-primary" />Automatic product mapping</p>
          </div>
          <section className="rounded-sm border border-border bg-brand-surface p-4 sm:p-5">
            <h3 className="font-semibold text-foreground">Catalog selection</h3>
            <p className="mt-1 text-xs text-brand-muted">Select existing category, parent category, and brand by name.</p>
            <input type="hidden" name="Category ID" value={selectedCategory?.id ?? ""} />
            <input type="hidden" name="Category Name" value={selectedCategory?.name ?? ""} />
            <input type="hidden" name="Parent Category" value={selectedParentCategory?.id ?? ""} />
            <input type="hidden" name="Brand ID" value={selectedBrand?.id ?? ""} />
            <input type="hidden" name="Brand Name" value={selectedBrand?.name ?? ""} />
            <input type="hidden" name="Product Categories" value={brandCategoryNames.join(", ")} />
            <input type="hidden" name="Tier 1" value={selectedBrand?.tier ?? ""} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pm-category-select">Category Name <span className="text-destructive">*</span></Label>
                <select id="pm-category-select" className={selectClassName} value={selectedCategoryId} onChange={(event) => handleCategoryChange(event.target.value)} required>
                  <option value="">Select category</option>
                  {lookups.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-parent-category-select">Parent Category</Label>
                <select id="pm-parent-category-select" className={selectClassName} value={selectedParentCategoryId} onChange={(event) => setSelectedParentCategoryId(event.target.value)}>
                  <option value="">No parent category</option>
                  {lookups.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-brand-select">Brand Name <span className="text-destructive">*</span></Label>
                <select id="pm-brand-select" className={selectClassName} value={selectedBrandId} onChange={(event) => setSelectedBrandId(event.target.value)} required>
                  <option value="">Select brand</option>
                  {lookups.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
            </div>
          </section>
          {groups.map((group) => <section key={group.title} className="rounded-sm border border-border bg-brand-surface p-4 sm:p-5">
            <h3 className="font-semibold text-foreground">{group.title}</h3><p className="mt-1 text-xs text-brand-muted">{group.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.fields.map((field) => <div key={field.key} className={`min-w-0 space-y-2 ${field.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                <Label htmlFor={`pm-${field.key}`}>{field.label ?? field.key}{field.required ? <span className="text-destructive"> *</span> : ""}</Label>
                {field.type === "textarea" ? <textarea id={`pm-${field.key}`} name={field.key} placeholder={fieldPlaceholder(field.key)} defaultValue={value(field.key, fallback[field.key])} maxLength={2000} className="min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" /> : <Input id={`pm-${field.key}`} name={field.key} placeholder={fieldPlaceholder(field.key)} type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? integerFields.has(field.key) ? "1" : "any" : undefined} inputMode={field.type === "number" ? integerFields.has(field.key) ? "numeric" : "decimal" : undefined} onKeyDown={field.type === "number" ? preventInvalidNumberKey : undefined} maxLength={field.type === "number" ? undefined : 255} defaultValue={value(field.key, fallback[field.key])} />}
              </div>)}
            </div>
          </section>)}
          <section className="rounded-sm border border-border bg-brand-surface p-4 sm:p-5"><h3 className="font-semibold">Marketplace settings & image upload</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["Marketplace Settings | Allow Backorders (Yes/No)","Marketplace Settings | Max Order Quantity","Marketplace Settings | Is Active (Yes/No)"].map((key) => <div key={key} className="space-y-2"><Label htmlFor={`pm-${key}`}>{key}</Label>{key.includes("Yes/No") ? <select id={`pm-${key}`} name={key} className={selectClassName} defaultValue={value(key, key.includes("Is Active") ? "Yes" : "No")}><option value="">Select option</option><option value="Yes">Yes</option><option value="No">No</option></select> : <Input id={`pm-${key}`} name={key} placeholder={fieldPlaceholder(key)} type="number" min="0" step="1" inputMode="numeric" onKeyDown={preventInvalidNumberKey} defaultValue={value(key)} />}</div>)}
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
