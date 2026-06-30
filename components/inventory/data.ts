import type { InventoryStat, Product } from "./types"

export const inventoryStats: readonly InventoryStat[] = [
  { label: "Total Products", value: "4", valueClassName: "text-foreground" },
  { label: "Low Stock", value: "2", valueClassName: "text-brand-warning" },
  { label: "Out of Stock", value: "1", valueClassName: "text-destructive" },
  { label: "Unmapped", value: "1", valueClassName: "text-foreground" },
]

const emptyProductContent = {
  category: "Not provided",
  mappingError: null,
  source: null,
  imageUrls: [] as string[],
  imageKeys: [] as string[],
  badgeText: null,
  heading: null,
  description: null,
  keyFeatures: [] as string[],
  priceValue: 0,
  currency: "AED" as const,
}

export const products: readonly Product[] = [
  {
    ...emptyProductContent,
    partNumber: "BP-001",
    productName: "Brake Pads - Front",
    brand: "Brembo",
    oemNumber: "04465-YZZR7",
    stock: 45,
    price: "AED 89.99",
    mapping: "Mapped",
    mappingStatus: "Mapped",
    vehicles: "234 fits",
  },
  {
    ...emptyProductContent,
    partNumber: "OF-002",
    productName: "Oil Filter",
    brand: "Mobil 1",
    oemNumber: "90915-YZZD2",
    stock: 12,
    price: "AED 12.99",
    mapping: "Mapped",
    mappingStatus: "Processing",
    vehicles: "567 fits",
  },
  {
    ...emptyProductContent,
    partNumber: "AF-003",
    productName: "Air Filter",
    brand: "K&N",
    oemNumber: "17801-0M030",
    stock: 0,
    price: "AED 19.99",
    mapping: "Unmapped",
    mappingStatus: "Pending Review",
    vehicles: "0 fits",
  },
  {
    ...emptyProductContent,
    partNumber: "SP-004",
    productName: "Spark Plugs",
    brand: "NGK",
    oemNumber: "90919-01253",
    stock: 8,
    price: "AED 11.25",
    mapping: "Mapped",
    mappingStatus: "Failed",
    vehicles: "892 fits",
  },
]
