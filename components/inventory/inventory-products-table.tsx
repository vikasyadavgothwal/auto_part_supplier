"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStockClassName, MappingBadge, SupplierMappingStatusBadge } from "./inventory-status"
import type { Product } from "./types"

const headers = ["Vendor SKU","Product Name","Brand","OEM","Stock","Price","Mapping","Status","Vehicles","Actions"]
export function InventoryProductsTable({ products, onEditProduct }: { products: readonly Product[]; onEditProduct: (product: Product) => void }) {
  const [selected, setSelected] = useState<Product | null>(null)
  return <><Card className="surface-card w-full min-w-0 overflow-hidden rounded-sm py-0 shadow-none"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow className="bg-brand-surface">{headers.map((header) => <TableHead key={header} className="min-w-[120px] px-6 py-4 text-brand-muted">{header}</TableHead>)}</TableRow></TableHeader><TableBody>
    {!products.length ? <TableRow><TableCell colSpan={headers.length} className="px-6 py-10 text-center text-brand-muted">No parts added yet. Use Add Single Product or Import Excel.</TableCell></TableRow> : null}
    {products.map((product) => <TableRow key={product.id ?? product.partNumber} className="border-b border-border hover:bg-brand-panel-strong"><TableCell className="px-6 py-4 font-medium text-primary">{product.vendorSku ?? product.partNumber}</TableCell><TableCell className="px-6 py-4">{product.productName}</TableCell><TableCell className="px-6 py-4">{product.brand}</TableCell><TableCell className="px-6 py-4">{product.oemNumber}</TableCell><TableCell className={`px-6 py-4 font-semibold ${getStockClassName(product.stock)}`}>{product.stock}</TableCell><TableCell className="px-6 py-4 font-semibold">{product.price}</TableCell><TableCell className="px-6 py-4"><MappingBadge mapping={product.mapping} /></TableCell><TableCell className="px-6 py-4"><SupplierMappingStatusBadge status={product.mappingStatus} /></TableCell><TableCell className="px-6 py-4">{product.vehicles}</TableCell><TableCell className="px-6 py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label={`Actions for ${product.productName}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Product actions</DropdownMenuLabel><DropdownMenuItem onSelect={() => setSelected(product)}><Eye />View product</DropdownMenuItem><DropdownMenuItem onSelect={() => onEditProduct(product)}><Pencil />Edit all Product Master fields</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}
  </TableBody></Table></div></Card>
  <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-3xl"><DialogHeader><DialogTitle>{selected?.productName ?? "Product details"}</DialogTitle><DialogDescription>Your supplier offer and mapping information.</DialogDescription></DialogHeader>{selected ? <div className="grid gap-3 rounded-sm border border-border bg-brand-surface p-4 text-sm sm:grid-cols-2"><p><strong>SKU:</strong> {selected.vendorSku}</p><p><strong>Brand:</strong> {selected.brand}</p><p><strong>MPN:</strong> {selected.partNumber}</p><p><strong>OEM:</strong> {selected.oemNumber}</p><p><strong>Category:</strong> {selected.category}</p><p><strong>Stock:</strong> {selected.stock}</p><p><strong>Price:</strong> {selected.price}</p><p><strong>Mapping:</strong> {selected.mappingStatus}</p><p><strong>Competitor:</strong> {[selected.competitorBrandName,selected.competitorPartNumber].filter(Boolean).join(" · ") || "-"}</p><p><strong>HS code:</strong> {selected.hsCode ?? "-"}</p>{selected.mappingError ? <p className="sm:col-span-2 text-brand-warning"><strong>Mapping note:</strong> {selected.mappingError}</p> : null}</div> : null}</DialogContent></Dialog>
  </>
}
