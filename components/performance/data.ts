import {
  Clock3,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

import type {
  CustomerFeedback,
  PerformanceMetric,
  TopSellingProduct,
} from "./types"

export const performanceMetrics: readonly PerformanceMetric[] = [
  {
    title: "Monthly Revenue",
    value: "$48,920",
    subtitle: "Up 23% vs last month",
    subtitleClassName: "text-primary",
    icon: DollarSign,
  },
  {
    title: "Customer Rating",
    value: "4.8 / 5.0",
    subtitle: "Based on 234 reviews",
    subtitleClassName: "text-brand-muted",
    icon: Star,
  },
  {
    title: "Response Time",
    value: "2.4 hrs",
    subtitle: "15% faster than last month",
    subtitleClassName: "text-primary",
    icon: Clock3,
  },
  {
    title: "RFQ Conversion",
    value: "68%",
    subtitle: "Last 30 days",
    subtitleClassName: "text-brand-muted",
    icon: TrendingUp,
  },
  {
    title: "Orders Fulfilled",
    value: "156",
    subtitle: "Up 12% vs last month",
    subtitleClassName: "text-primary",
    icon: Package,
  },
  {
    title: "Repeat Customers",
    value: "42%",
    subtitle: "Up 8% increase",
    subtitleClassName: "text-primary",
    icon: Users,
  },
]

export const topSellingProducts: readonly TopSellingProduct[] = [
  {
    rank: 1,
    name: "Brake Pads - Front",
    unitsSold: "45 units sold",
    revenue: "$4,049.55",
  },
  {
    rank: 2,
    name: "Oil Filter",
    unitsSold: "89 units sold",
    revenue: "$1,156.11",
  },
  {
    rank: 3,
    name: "Air Filter",
    unitsSold: "67 units sold",
    revenue: "$1,339.33",
  },
  {
    rank: 4,
    name: "Spark Plugs",
    unitsSold: "124 units sold",
    revenue: "$1,395.00",
  },
]

export const customerFeedback: readonly CustomerFeedback[] = [
  {
    name: "John Doe",
    rating: 5,
    feedback: "Fast shipping and excellent product quality!",
    time: "Yesterday",
  },
  {
    name: "Jane Smith",
    rating: 5,
    feedback: "Great prices and responsive customer service.",
    time: "2 days ago",
  },
  {
    name: "Mike Johnson",
    rating: 4,
    feedback: "Good quality parts, delivery was a bit slow.",
    time: "3 days ago",
  },
]
