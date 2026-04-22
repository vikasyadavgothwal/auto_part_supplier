import {
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"

import { appRoutes } from "@/lib/routes"

import type {
  DashboardRfq,
  DashboardStat,
  Integration,
  QuickLink,
  RecentOrder,
} from "./types"

export const dashboardStats: readonly DashboardStat[] = [
  {
    label: "Today's Revenue",
    value: "$2,450",
    change: "↑ 12% vs yesterday",
    icon: DollarSign,
  },
  {
    label: "Monthly Revenue",
    value: "$48,920",
    change: "↑ 23% vs last month",
    icon: TrendingUp,
  },
  {
    label: "RFQ Conversion",
    value: "68%",
    change: "Last 30 days",
    icon: FileText,
    neutral: true,
  },
  {
    label: "Low Stock Alerts",
    value: "5",
    change: "Items need restocking",
    icon: TriangleAlert,
    neutral: true,
  },
]

export const quickLinks: readonly QuickLink[] = [
  {
    label: "Pending RFQs",
    value: "3",
    icon: FileText,
    href: appRoutes.rfqInbox,
    highlight: true,
  },
  {
    label: "Products Listed",
    value: "247",
    icon: Package,
    href: appRoutes.inventory,
  },
  {
    label: "Active Orders",
    value: "12",
    icon: ShoppingCart,
    href: appRoutes.orders,
  },
]

export const dashboardRfqs: readonly DashboardRfq[] = [
  {
    id: "RFQ-501",
    vehicle: "2019 Toyota Camry",
    part: "Brake Pads - Front",
    qty: "1 Set",
    deadline: "2 days",
    deadlineUrgent: false,
    status: "New",
  },
  {
    id: "RFQ-502",
    vehicle: "2020 Honda Accord",
    part: "Oil Filter",
    qty: "5",
    deadline: "1 day",
    deadlineUrgent: true,
    status: "Expiring",
  },
  {
    id: "RFQ-503",
    vehicle: "2021 Ford F-150",
    part: "Air Filter",
    qty: "10",
    deadline: "5 days",
    deadlineUrgent: false,
    status: "New",
  },
]

export const recentOrders: readonly RecentOrder[] = [
  {
    id: "ORD-401",
    customer: "John Doe",
    part: "Brake Pads",
    qty: "1 Set",
    amount: "$89.99",
    status: "Processing",
  },
  {
    id: "ORD-402",
    customer: "Jane Smith",
    part: "Oil Filter",
    qty: "2",
    amount: "$49.98",
    status: "Shipped",
  },
]

export const integrations: readonly Integration[] = [
  {
    icon: Package,
    label: "Inventory System",
    sub: "247 products synced",
    status: "synced",
    time: "5 min ago",
  },
  {
    icon: ShoppingCart,
    label: "Order Management",
    sub: "12 active orders",
    status: "syncing",
    time: "",
  },
  {
    icon: FileText,
    label: "Quote System",
    sub: "Real-time pricing",
    status: "synced",
    time: "Just now",
  },
]
