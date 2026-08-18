"use client"

import { useState } from "react"
import { CircleDollarSign, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStockClassName, SupplierMappingStatusBadge } from "./inventory-status"
import type { Product } from "./types"

const headers = ["Vendor SKU","Product Name","Category","Brand","OEM","Stock","Price","Status","Product state","Actions"]
export function InventoryProductsTable({ products, onEditProduct, onDeleteProduct, onUpdateStockPrice, onUpgradePlan }: { products: readonly Product[]; onEditProduct: (product: Product) => void; onDeleteProduct: (product: Product) => Promise<void>; onUpdateStockPrice: (product: Product, input: { stock: number; price: number }) => Promise<void>; onUpgradePlan: () => void }) {
  const [selected, setSelected] = useState<Product | null>(null)
  const [reasonProduct, setReasonProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [stockPriceProduct, setStockPriceProduct] = useState<Product | null>(null)
  const [stockValue, setStockValue] = useState("")
  const [priceValue, setPriceValue] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [stockPriceError, setStockPriceError] = useState<string | null>(null)
  const [isUpdatingStockPrice, setIsUpdatingStockPrice] = useState(false)
  const openStockPriceModal = (product: Product) => {
    setStockPriceProduct(product)
    setStockValue(String(product.stock))
    setPriceValue(String(product.priceValue))
    setStockPriceError(null)
  }
  const productIsActive = (product: Product) =>
    product.isActive && product.mapping === "Mapped"
  const reasonFor = (product: Product) =>
    [
      product.mapping !== "Mapped" ? product.mappingError || "This product is waiting for admin mapping." : "",
      !product.isActive ? product.planSuspensionReason || "This product is inactive under your current plan limits." : "",
    ].filter(Boolean).join(" ")
  const submitStockPrice = async () => {
    if (!stockPriceProduct) return
    const stock = Number(stockValue)
    const price = Number(priceValue)
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
      setStockPriceError("Stock must be a whole number from 0 to 1,000,000.")
      return
    }
    if (!Number.isFinite(price) || price < 0 || price > 1000000) {
      setStockPriceError("Price must be a valid amount from 0 to 1,000,000.")
      return
    }
    setIsUpdatingStockPrice(true)
    setStockPriceError(null)
    try {
      await onUpdateStockPrice(stockPriceProduct, { stock, price })
      setStockPriceProduct(null)
    } catch (error) {
      setStockPriceError(error instanceof Error ? error.message : "Unable to update stock and price")
    } finally {
      setIsUpdatingStockPrice(false)
    }
  }
  return <><Card className="surface-card w-full min-w-0 overflow-hidden rounded-sm py-0 shadow-none"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow className="bg-brand-surface">{headers.map((header) => <TableHead key={header} className="min-w-[120px] px-6 py-4 text-brand-muted">{header}</TableHead>)}</TableRow></TableHeader><TableBody>
    {!products.length ? <TableRow><TableCell colSpan={headers.length} className="px-6 py-10 text-center text-brand-muted">No parts added yet. Use Add Single Product or Import Excel.</TableCell></TableRow> : null}
    {products.map((product) => {
      const active = productIsActive(product)
      const reason = reasonFor(product)
      return <TableRow key={product.id ?? product.partNumber} className={`border-b border-border ${active ? "hover:bg-brand-panel-strong" : "bg-muted/30 text-muted-foreground"}`}><TableCell className="px-6 py-4"><div className="flex min-w-40 flex-col gap-1"><span className="font-medium text-primary">{product.vendorSku ?? product.partNumber}</span>{product.isFeaturedVendorProduct ? <Badge variant="outline" className="w-fit border-amber-500/30 bg-amber-500/10 text-amber-600">Featured Supplier</Badge> : null}</div></TableCell><TableCell className="px-6 py-4">{product.productName}</TableCell><TableCell className="px-6 py-4"><span className="rounded-full border border-border bg-background px-2 py-1 text-xs font-medium text-foreground">{product.category || "Not provided"}</span></TableCell><TableCell className="px-6 py-4">{product.brand}</TableCell><TableCell className="px-6 py-4">{product.oemNumber}</TableCell><TableCell className={`px-6 py-4 font-semibold ${getStockClassName(product.stock)}`}>{product.stock}</TableCell><TableCell className="px-6 py-4 font-semibold">{product.price}</TableCell><TableCell className="px-6 py-4"><SupplierMappingStatusBadge status={product.mappingStatus} /></TableCell><TableCell className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${active ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{active ? "Active" : "Inactive"}</span></TableCell><TableCell className="px-6 py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label={`Actions for ${product.productName}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-72"><DropdownMenuLabel>Product actions</DropdownMenuLabel><DropdownMenuItem onSelect={() => setSelected(product)}><Eye />View product</DropdownMenuItem>{reason ? <DropdownMenuItem onSelect={() => setReasonProduct(product)}><Eye />View reason</DropdownMenuItem> : null}<DropdownMenuItem onSelect={() => openStockPriceModal(product)}><CircleDollarSign />Update stock & price</DropdownMenuItem>{active ? <DropdownMenuItem onSelect={() => onEditProduct(product)}><Pencil />Edit Product Master fields</DropdownMenuItem> : product.isActive ? <DropdownMenuItem onSelect={() => onEditProduct(product)}><Pencil />Edit Product Master fields</DropdownMenuItem> : <DropdownMenuItem onSelect={onUpgradePlan}><Pencil />Upgrade plan to activate</DropdownMenuItem>}<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => { setDeleteError(null); setDeleting(product) }}><Trash2 />Delete product</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>
    })}
  </TableBody></Table></div></Card>
  <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-3xl"><DialogHeader><DialogTitle>{selected?.productName ?? "Product details"}</DialogTitle><DialogDescription>Your supplier offer and mapping information.</DialogDescription></DialogHeader>{selected ? <div className="grid gap-3 rounded-sm border border-border bg-brand-surface p-4 text-sm sm:grid-cols-2"><p><strong>SKU:</strong> {selected.vendorSku}</p><p><strong>Brand:</strong> {selected.brand}</p><p><strong>MPN:</strong> {selected.partNumber}</p><p><strong>OEM:</strong> {selected.oemNumber}</p><p><strong>Category:</strong> {selected.category}</p><p><strong>Stock:</strong> {selected.stock}</p><p><strong>Price:</strong> {selected.price}</p><p><strong>Mapping:</strong> {selected.mappingStatus}</p><p><strong>Product state:</strong> {productIsActive(selected) ? "Active" : "Inactive"}</p><p><strong>Competitor:</strong> {[selected.competitorBrandName,selected.competitorPartNumber].filter(Boolean).join(" · ") || "-"}</p><p><strong>HS code:</strong> {selected.hsCode ?? "-"}</p>{selected.planSuspensionReason ? <p className="sm:col-span-2 text-brand-warning"><strong>Plan note:</strong> {selected.planSuspensionReason}</p> : null}{selected.mappingError ? <p className="sm:col-span-2 text-brand-warning"><strong>Mapping note:</strong> {selected.mappingError}</p> : null}</div> : null}</DialogContent></Dialog>
  <Dialog open={!!reasonProduct} onOpenChange={(open) => !open && setReasonProduct(null)}><DialogContent className="rounded-sm bg-brand-panel sm:max-w-lg"><DialogHeader><DialogTitle>Product reason</DialogTitle><DialogDescription>{reasonProduct?.productName ?? "Product"} is not currently active in marketplace inventory.</DialogDescription></DialogHeader>{reasonProduct ? <div className="space-y-3 rounded-sm border border-border bg-brand-surface p-4 text-sm"><p><strong>Status:</strong> {reasonProduct.mappingStatus}</p><p><strong>Product state:</strong> {productIsActive(reasonProduct) ? "Active" : "Inactive"}</p><p className="text-brand-muted">{reasonFor(reasonProduct) || "No reason was saved for this product."}</p></div> : null}<DialogFooter><Button type="button" onClick={() => setReasonProduct(null)}>Close</Button></DialogFooter></DialogContent></Dialog>
  <Dialog open={!!stockPriceProduct} onOpenChange={(open) => { if (!open && !isUpdatingStockPrice) setStockPriceProduct(null) }}>
    <DialogContent className="rounded-sm bg-brand-panel sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update stock & price</DialogTitle>
        <DialogDescription>{stockPriceProduct?.productName ?? "Product"} stock and price only.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        {stockPriceError ? <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{stockPriceError}</p> : null}
        <div className="space-y-2">
          <Label htmlFor="inventory-stock">Stock <span className="text-destructive">*</span></Label>
          <Input id="inventory-stock" type="number" min={0} max={1000000} step={1} inputMode="numeric" value={stockValue} onChange={(event) => setStockValue(event.target.value.replace(/\D/g, "").slice(0, 7))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventory-price">Price <span className="text-destructive">*</span></Label>
          <Input id="inventory-price" type="number" min={0} max={1000000} step="0.01" inputMode="decimal" value={priceValue} onChange={(event) => setPriceValue(event.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 12))} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" disabled={isUpdatingStockPrice} onClick={() => setStockPriceProduct(null)}>Cancel</Button>
        <Button type="button" disabled={isUpdatingStockPrice} onClick={() => void submitStockPrice()}>{isUpdatingStockPrice ? "Updating..." : "Update"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null) }}><DialogContent className="rounded-sm bg-brand-panel"><DialogHeader><DialogTitle>Delete product?</DialogTitle><DialogDescription>{deleting?.productName} will be permanently removed from your supplier inventory. This cannot be undone.</DialogDescription></DialogHeader>{deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}<DialogFooter><Button type="button" variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button type="button" variant="destructive" disabled={!deleting} onClick={async () => { if (!deleting) return; try { await onDeleteProduct(deleting); setDeleting(null) } catch (error) { setDeleteError(error instanceof Error ? error.message : "Unable to delete product") } }}>Delete product</Button></DialogFooter></DialogContent></Dialog>
  </>
}
