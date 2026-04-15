"use client"

import {
  Plus,
  TriangleAlert,
  Upload,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Total Products", value: "4", valueClassName: "text-foreground" },
  { label: "Low Stock", value: "2", valueClassName: "text-brand-warning" },
  { label: "Out of Stock", value: "1", valueClassName: "text-destructive" },
  { label: "Unmapped", value: "1", valueClassName: "text-foreground" },
] as const

type MappingStatus = "Mapped" | "Unmapped"

type Product = {
  partNumber: string
  productName: string
  brand: string
  stock: number
  price: string
  mapping: MappingStatus
  vehicles: string
}

const products: Product[] = [
  {
    partNumber: "BP-001",
    productName: "Brake Pads - Front",
    brand: "Brembo",
    stock: 45,
    price: "$89.99",
    mapping: "Mapped",
    vehicles: "234 fits",
  },
  {
    partNumber: "OF-002",
    productName: "Oil Filter",
    brand: "Mobil 1",
    stock: 12,
    price: "$12.99",
    mapping: "Mapped",
    vehicles: "567 fits",
  },
  {
    partNumber: "AF-003",
    productName: "Air Filter",
    brand: "K&N",
    stock: 0,
    price: "$19.99",
    mapping: "Unmapped",
    vehicles: "0 fits",
  },
  {
    partNumber: "SP-004",
    productName: "Spark Plugs",
    brand: "NGK",
    stock: 8,
    price: "$11.25",
    mapping: "Mapped",
    vehicles: "892 fits",
  },
]

function getMappingBadge(mapping: MappingStatus) {
  switch (mapping) {
    case "Mapped":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Mapped
        </Badge>
      )
    case "Unmapped":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Unmapped
        </Badge>
      )
  }
}

function getStockClassName(stock: number) {
  if (stock === 0) return "text-destructive"
  if (stock <= 12) return "text-brand-warning"
  return "text-foreground"
}

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Inventory
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Manage your product catalog and stock levels.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-12 rounded-lg border-border bg-brand-panel-strong px-6 text-foreground hover:border-primary hover:bg-brand-panel-strong"
            >
              <Upload className="mr-2 h-5 w-5" />
              Import CSV
            </Button>
            <Button className="h-12 rounded-lg px-6 hover:bg-brand-primary-hover">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="surface-card rounded-lg shadow-none">
              <CardContent className="p-6">
                <div className="text-sm text-brand-muted">{stat.label}</div>
                <div className={`mt-2 text-3xl font-bold ${stat.valueClassName}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="border-brand-warning/20 bg-brand-warning/10 text-foreground">
          <TriangleAlert className="h-5 w-5 !text-brand-warning" />
          <AlertTitle className="text-brand-warning">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-sm text-brand-muted">
            2 products have low stock. Consider restocking to avoid missed sales.
          </AlertDescription>
        </Alert>

        <Card className="surface-card overflow-hidden rounded-lg shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Part #
                  </TableHead>
                  <TableHead className="min-w-[220px] px-6 py-4 text-brand-muted">
                    Product Name
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Brand
                  </TableHead>
                  <TableHead className="min-w-[100px] px-6 py-4 text-brand-muted">
                    Stock
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Price
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Mapping
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Vehicles
                  </TableHead>
                  <TableHead className="min-w-[100px] px-6 py-4 text-brand-muted">
                    Actions
                  </TableHead>
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
                      <span className={`font-semibold ${getStockClassName(product.stock)}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-foreground">
                        {product.price}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {getMappingBadge(product.mapping)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {product.vehicles}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Button className="h-9 rounded-lg bg-brand-panel-strong px-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="surface-card rounded-lg shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Product Mapping</CardTitle>
            <CardDescription className="text-brand-muted">
              Map your products to vehicle fitment data to appear in search
              results and receive relevant RFQs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="rounded-lg px-6 text-sm hover:bg-brand-primary-hover">
              Learn About Mapping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
