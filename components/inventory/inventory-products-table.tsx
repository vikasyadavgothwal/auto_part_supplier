"use client"

import { useState, type FormEvent } from "react"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getStockClassName,
  MappingBadge,
  SupplierMappingStatusBadge,
} from "./inventory-status"
import { mapSupplierPartToProduct } from "./mappers"
import type {
  Product,
  SupplierPartUpdateResponse,
} from "./types"

type InventoryProductsTableProps = {
  products: readonly Product[]
  onProductUpdated: (product: Product) => void
}

const tableHeaders = [
  { label: "Vendor SKU", className: "min-w-[130px] px-6 py-4 text-brand-muted" },
  {
    label: "Product Name",
    className: "min-w-[220px] px-6 py-4 text-brand-muted",
  },
  { label: "Brand", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  { label: "OEM", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  { label: "Stock", className: "min-w-[100px] px-6 py-4 text-brand-muted" },
  { label: "Price", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  {
    label: "Mapping",
    className: "min-w-[120px] px-6 py-4 text-brand-muted",
  },
  {
    label: "Status",
    className: "min-w-[150px] px-6 py-4 text-brand-muted",
  },
  {
    label: "Vehicles",
    className: "min-w-[120px] px-6 py-4 text-brand-muted",
  },
  {
    label: "Actions",
    className: "min-w-[100px] px-6 py-4 text-brand-muted",
  },
] as const

export function InventoryProductsTable({
  products,
  onProductUpdated,
}: InventoryProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingProduct?.id) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const price = Number(formData.get("price"))
    const stock = Number(formData.get("stock"))
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const response = await authenticatedFetch(
        `/api/supplier/parts/${editingProduct.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price, stock }),
        },
      )
      const payload = (await response.json()) as SupplierPartUpdateResponse
      if (!response.ok || !payload.ok || !payload.part) {
        throw new Error(payload.message ?? "Unable to update price and stock")
      }

      onProductUpdated(mapSupplierPartToProduct(payload.part))
      setEditingProduct(null)
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Unable to update product",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Card className="surface-card w-full min-w-0 overflow-hidden rounded-sm shadow-none py-0">
      <div className="w-full max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
              {tableHeaders.map((header) => (
                <TableHead key={header.label} className={header.className}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length === 0 ? (
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableCell
                  colSpan={tableHeaders.length}
                  className="px-6 py-10 text-center text-sm text-brand-muted"
                >
                  No parts added yet. Use Add Product to create supplier stock
                  and start mapping.
                </TableCell>
              </TableRow>
            ) : null}

            {products.map((product) => (
              <TableRow
                key={product.id ?? product.partNumber}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">
                    {product.vendorSku ?? product.partNumber}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.productName}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.brand}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.oemNumber}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span
                    className={`font-semibold ${getStockClassName(product.stock)}`}
                  >
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-semibold text-foreground">
                    {product.price}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <MappingBadge mapping={product.mapping} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <SupplierMappingStatusBadge status={product.mappingStatus} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.vehicles}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${product.productName}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Product actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setSelectedProduct(product)}>
                        <Eye />
                        View product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setUpdateError(null)
                          setEditingProduct(product)
                        }}
                      >
                        <Pencil />
                        Update price & stock
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </Card>

      <Dialog
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm bg-brand-panel sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.productName ?? "Product details"}</DialogTitle>
            <DialogDescription>
              View your submitted offer and the current master catalog content.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-sm border border-border bg-brand-surface p-4 text-sm sm:grid-cols-2">
                <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>MPN:</strong> {selectedProduct.partNumber}</p>
                <p><strong>OEM:</strong> {selectedProduct.oemNumber}</p>
                <p><strong>Vendor SKU:</strong> {selectedProduct.vendorSku ?? "-"}</p>
                <p><strong>HS code:</strong> {selectedProduct.hsCode ?? "-"}</p>
                <p><strong>Price:</strong> {selectedProduct.price}</p>
                <p><strong>Quantity:</strong> {selectedProduct.stock}</p>
                <p><strong>Status:</strong> {selectedProduct.mappingStatus}</p>
                <p><strong>Vehicle mapping:</strong> {selectedProduct.vehicles}</p>
              </div>

              <div className="grid gap-3 rounded-sm border border-border p-4 text-sm sm:grid-cols-2">
                <p>
                  <strong>OEM supersessions:</strong>{" "}
                  {selectedProduct.oemSupersessionNumbers.join(", ") || "-"}
                </p>
                <p>
                  <strong>Competitor:</strong>{" "}
                  {[selectedProduct.competitorBrandName, selectedProduct.competitorPartNumber]
                    .filter(Boolean)
                    .join(" · ") || "-"}
                </p>
              </div>

              {selectedProduct.mappingError ? (
                <p className="rounded-sm border border-brand-warning/20 bg-brand-warning/10 p-3 text-sm text-brand-muted">
                  {selectedProduct.mappingError}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(selectedProduct.imageKeys.length
                  ? selectedProduct.imageKeys.map(
                      (key) =>
                        `/api/supplier/parts/product-image?key=${encodeURIComponent(key)}`,
                    )
                  : selectedProduct.imageUrls
                ).map((imageUrl) => (
                  <div
                    key={imageUrl}
                    role="img"
                    aria-label={selectedProduct.productName}
                    className="aspect-square rounded-sm border border-border bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                ))}
              </div>

              <div className="space-y-3 rounded-sm border border-border p-4 text-sm">
                <p><strong>Badge:</strong> {selectedProduct.badgeText ?? "-"}</p>
                <p><strong>Heading:</strong> {selectedProduct.heading ?? "-"}</p>
                <p><strong>Description:</strong> {selectedProduct.description ?? "-"}</p>
                <div>
                  <strong>Key features:</strong>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {selectedProduct.keyFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setEditingProduct(null)
            setUpdateError(null)
          }
        }}
      >
        <DialogContent className="rounded-sm bg-brand-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update price and stock</DialogTitle>
            <DialogDescription>
              {editingProduct?.productName}. Currency is fixed to AED.
            </DialogDescription>
          </DialogHeader>

          {updateError ? (
            <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {updateError}
            </p>
          ) : null}

          {editingProduct ? (
            <form className="space-y-5" onSubmit={handleUpdate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="update-price">Price</Label>
                  <Input
                    id="update-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingProduct.priceValue}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-stock">Quantity</Label>
                  <Input
                    id="update-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={editingProduct.stock}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Currency</Label>
                  <div className="flex h-10 items-center rounded-sm border border-input bg-brand-surface px-3 text-sm font-semibold">
                    AED
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update inventory"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
