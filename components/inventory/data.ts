import type { InventoryStat, Product } from "./types"

export const inventoryStats: readonly InventoryStat[] = [
  { label: "Total Products", value: "4", valueClassName: "text-foreground" },
  { label: "Low Stock", value: "2", valueClassName: "text-brand-warning" },
  { label: "Out of Stock", value: "1", valueClassName: "text-destructive" },
  { label: "Unmapped", value: "1", valueClassName: "text-foreground" },
]

export const products: readonly Product[] = [
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
