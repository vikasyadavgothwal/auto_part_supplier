import type { FilterOption } from "../shared/types"
import type { Order, OrderFilter, OrderStat } from "./types"

export const orderStats: readonly OrderStat[] = [
  { label: "Total Orders", value: "4", valueClassName: "text-foreground" },
  { label: "Processing", value: "2", valueClassName: "text-brand-warning" },
  { label: "Shipped", value: "1", valueClassName: "text-brand-info" },
  { label: "Revenue", value: "$205.46", valueClassName: "text-primary" },
]

export const orders: readonly Order[] = [
  {
    id: "ORD-401",
    date: "2024-01-22",
    customer: "John Doe",
    part: "Brake Pads",
    qty: "1 Set",
    amount: "$89.99",
    shipping: "Standard",
    status: "Processing",
  },
  {
    id: "ORD-402",
    date: "2024-01-21",
    customer: "Jane Smith",
    part: "Oil Filter",
    qty: "2",
    amount: "$49.98",
    shipping: "2-Day",
    status: "Shipped",
  },
  {
    id: "ORD-403",
    date: "2024-01-20",
    customer: "Mike Johnson",
    part: "Air Filter",
    qty: "1",
    amount: "$19.99",
    shipping: "Standard",
    status: "Completed",
  },
  {
    id: "ORD-404",
    date: "2024-01-22",
    customer: "Sarah Williams",
    part: "Spark Plugs",
    qty: "4",
    amount: "$45.50",
    shipping: "Overnight",
    status: "Processing",
  },
]

export const orderFilters: readonly FilterOption<OrderFilter>[] = [
  { key: "All Orders", label: "All Orders" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Completed", label: "Completed" },
]
