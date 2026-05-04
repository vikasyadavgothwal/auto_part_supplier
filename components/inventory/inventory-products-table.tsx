import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getStockClassName, MappingBadge } from "./inventory-status"
import type { Product } from "./types"

type InventoryProductsTableProps = {
  products: readonly Product[]
}

const tableHeaders = [
  { label: "Part #", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  {
    label: "Product Name",
    className: "min-w-[220px] px-6 py-4 text-brand-muted",
  },
  { label: "Brand", className: "min-w-[120px] px-6 py-4 text-brand-muted" },
  { label: "Stock", className: "min-w-[100px] px-6 py-4 text-brand-muted" },
  { label: "Price", className: "min-w-[110px] px-6 py-4 text-brand-muted" },
  {
    label: "Mapping",
    className: "min-w-[120px] px-6 py-4 text-brand-muted",
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
}: InventoryProductsTableProps) {
  return (
    <Card className="surface-card overflow-hidden rounded-sm shadow-none py-0">
      <div className="overflow-x-auto">
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
            {products.map((product) => (
              <TableRow
                key={product.partNumber}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">
                    {product.partNumber}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.productName}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  {product.brand}
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
                  {product.vehicles}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <Button className="h-9 rounded-sm bg-brand-panel-strong px-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
