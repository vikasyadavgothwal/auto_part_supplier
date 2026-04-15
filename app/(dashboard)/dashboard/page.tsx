"use client";

import {
  DollarSign,
  TrendingUp,
  FileText,
  TriangleAlert,
  Package,
  ShoppingCart,
  Shield,
  Star,
  CircleCheck,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
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
];

const quickLinks = [
  { label: "Pending RFQs", value: "3", icon: FileText, href: "/dashboard/supplier/rfqs", highlight: true },
  { label: "Products Listed", value: "247", icon: Package, href: "/dashboard/supplier/inventory" },
  { label: "Active Orders", value: "12", icon: ShoppingCart, href: "/dashboard/supplier/orders" },
];

const rfqs = [
  {
    id: "RFQ-501",
    vehicle: "2019 Toyota Camry",
    part: "Brake Pads - Front",
    qty: "1 Set",
    deadline: "2 days",
    deadlineUrgent: false,
    status: "New",
    statusVariant: "new" as const,
  },
  {
    id: "RFQ-502",
    vehicle: "2020 Honda Accord",
    part: "Oil Filter",
    qty: "5",
    deadline: "1 day",
    deadlineUrgent: true,
    status: "Expiring",
    statusVariant: "expiring" as const,
  },
  {
    id: "RFQ-503",
    vehicle: "2021 Ford F-150",
    part: "Air Filter",
    qty: "10",
    deadline: "5 days",
    deadlineUrgent: false,
    status: "New",
    statusVariant: "new" as const,
  },
];

const orders = [
  {
    id: "ORD-401",
    customer: "John Doe",
    part: "Brake Pads",
    qty: "1 Set",
    amount: "$89.99",
    status: "Processing",
    statusVariant: "processing" as const,
  },
  {
    id: "ORD-402",
    customer: "Jane Smith",
    part: "Oil Filter",
    qty: "2",
    amount: "$49.98",
    status: "Shipped",
    statusVariant: "shipped" as const,
  },
];

const integrations = [
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
];

// ─── Badge helpers ────────────────────────────────────────────────────────────

function RfqBadge({ variant }: { variant: "new" | "expiring" }) {
  if (variant === "expiring")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        Expiring
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-500 border-blue-500/20">
      New
    </span>
  );
}

function OrderBadge({ variant }: { variant: "processing" | "shipped" }) {
  if (variant === "shipped")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
        Shipped
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
      Processing
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupplierDashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-[#9CA3AF]">Monitor your business performance and manage operations.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#DC2626] transition-all cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-[#9CA3AF]">{s.label}</p>
                <div className="p-2 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg">
                  <s.icon className="w-5 h-5 text-[#DC2626]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{s.value}</p>
              <p className={`text-sm ${s.neutral ? "text-[#9CA3AF]" : "text-[#DC2626]"}`}>
                {s.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className={`flex items-center gap-4 p-6 rounded-lg border transition-all ${
              q.highlight
                ? "bg-[#DC2626]/10 border-[#DC2626]/20 hover:bg-[#DC2626]/20"
                : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#DC2626]"
            }`}
          >
            <div className={`p-3 rounded-lg ${q.highlight ? "bg-[#DC2626]" : "bg-[#DC2626]/10 border border-[#DC2626]/20"}`}>
              <q.icon className={`w-6 h-6 ${q.highlight ? "text-white" : "text-[#DC2626]"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{q.value}</p>
              <p className="text-sm text-[#9CA3AF]">{q.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* RFQ Inbox */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">RFQ Inbox</h2>
          <Link href="/dashboard/supplier/rfqs" className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors">
            View All
          </Link>
        </div>
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
                  {["RFQ ID", "Vehicle", "Part", "Quantity", "Deadline", "Status", "Action"].map((h) => (
                    <TableHead key={h} className="text-[#9CA3AF] font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqs.map((r) => (
                  <TableRow key={r.id} className="border-[#2A2A2A] hover:bg-[#2A2A2A] cursor-pointer transition-colors">
                    <TableCell className="text-[#9CA3AF]">{r.id}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{r.vehicle}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{r.part}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{r.qty}</TableCell>
                    <TableCell>
                      <span className={r.deadlineUrgent ? "text-red-500 font-semibold" : "text-[#9CA3AF]"}>
                        {r.deadline}
                      </span>
                    </TableCell>
                    <TableCell><RfqBadge variant={r.statusVariant} /></TableCell>
                    <TableCell>
                      <Button size="sm" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg px-4">
                        Quote
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <Link href="/dashboard/supplier/orders" className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors">
            View All
          </Link>
        </div>
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
                  {["Order ID", "Customer", "Part", "Quantity", "Amount", "Status"].map((h) => (
                    <TableHead key={h} className="text-[#9CA3AF] font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className="border-[#2A2A2A] hover:bg-[#2A2A2A] cursor-pointer transition-colors">
                    <TableCell className="text-[#9CA3AF]">{o.id}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{o.customer}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{o.part}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{o.qty}</TableCell>
                    <TableCell><span className="font-semibold text-white">{o.amount}</span></TableCell>
                    <TableCell><OrderBadge variant={o.statusVariant} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trust Score */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold text-white">Your Trust Score</CardTitle>
            <Link href="/dashboard/supplier/performance" className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors">
              View Details
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Score row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-yellow-500 text-base">85</span>
                <span className="text-xs text-[#9CA3AF]">/ 100</span>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs px-2 py-1">
                <CircleCheck className="w-3 h-3 text-green-500" />
                <span className="font-medium text-green-500">Synced</span>
                <span className="text-xs text-[#9CA3AF]">• 2 min ago</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-bold text-white">4.8</span>
                <span className="text-sm text-[#9CA3AF]">/ 5.0</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs px-1.5 py-0.5">
                <CircleCheck className="w-3 h-3 text-green-500" />
                <span className="font-medium text-green-500">Verified</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-[#9CA3AF]">2.4 hrs</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Response Time</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">96%</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Fulfillment Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">2%</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Cancellation Rate</p>
              </div>
            </div>

            {/* Alert */}
            <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Improve your response time by 30 minutes to reach Top Rated status!
                </p>
                <p className="text-xs text-[#9CA3AF]">Responding faster helps you win more RFQs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626]/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                  </div>
                </div>

                {item.status === "syncing" ? (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs px-2 py-1">
                    <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs px-2 py-1">
                    <CircleCheck className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-[#9CA3AF]">• {item.time}</span>
                  </div>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full mt-2 border-[#2A2A2A] text-white hover:border-[#DC2626] hover:bg-[#DC2626]/10 transition-all bg-transparent"
            >
              Manage Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}