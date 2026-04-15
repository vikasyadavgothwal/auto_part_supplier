"use client"

import * as React from "react"
import { BadgeCheck, Clock3, Funnel } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Total RFQs", value: "5", valueClassName: "text-foreground" },
  { label: "New", value: "2", valueClassName: "text-brand-info" },
  { label: "Expiring Soon", value: "2", valueClassName: "text-brand-warning" },
  { label: "Quoted", value: "1", valueClassName: "text-brand-success" },
] as const

type RfqStatus = "New" | "Expiring" | "Quoted"

type Rfq = {
  id: string
  buyer: string
  vehicle: string
  part: string
  quantity: string
  deadline: string
  status: RfqStatus
  created: string
}

const rfqs: Rfq[] = [
  {
    id: "RFQ-501",
    buyer: "John Doe",
    vehicle: "2019 Toyota Camry",
    part: "Brake Pads - Front",
    quantity: "1 Set",
    deadline: "2 days",
    status: "New",
    created: "2 hours ago",
  },
  {
    id: "RFQ-502",
    buyer: "Jane Smith",
    vehicle: "2020 Honda Accord",
    part: "Oil Filter",
    quantity: "5",
    deadline: "1 day",
    status: "Expiring",
    created: "1 day ago",
  },
  {
    id: "RFQ-503",
    buyer: "Mike Johnson",
    vehicle: "2021 Ford F-150",
    part: "Air Filter",
    quantity: "10",
    deadline: "5 days",
    status: "New",
    created: "3 hours ago",
  },
  {
    id: "RFQ-504",
    buyer: "Sarah Williams",
    vehicle: "2018 Chevrolet Malibu",
    part: "Spark Plugs",
    quantity: "4",
    deadline: "7 days",
    status: "Quoted",
    created: "2 days ago",
  },
  {
    id: "RFQ-505",
    buyer: "Tom Brown",
    vehicle: "2019 Nissan Altima",
    part: "Battery",
    quantity: "1",
    deadline: "1 day",
    status: "Expiring",
    created: "1 day ago",
  },
]

const filters = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Expiring", label: "Expiring", icon: Clock3 },
  { key: "Quoted", label: "Quoted", icon: BadgeCheck },
] as const

type FilterKey = (typeof filters)[number]["key"]

function getStatusBadge(status: RfqStatus) {
  switch (status) {
    case "New":
      return (
        <Badge className="border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10">
          New
        </Badge>
      )
    case "Expiring":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Expiring
        </Badge>
      )
    case "Quoted":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Quoted
        </Badge>
      )
  }
}

export default function RfqInboxPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("All")

  const filteredRfqs = React.useMemo(() => {
    if (activeFilter === "All") return rfqs
    return rfqs.filter((rfq) => rfq.status === activeFilter)
  }, [activeFilter])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              RFQ Inbox
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Review and respond to quote requests from buyers.
            </p>
          </div>

          <Button className="h-12 px-6 hover:bg-brand-primary-hover">
            Bulk Quote
          </Button>
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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-brand-muted">
            <Funnel className="h-5 w-5" />
            <span className="font-medium">Filter:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key

              return (
                <Button
                  key={filter.key}
                  type="button"
                  variant="outline"
                  onClick={() => setActiveFilter(filter.key)}
                  className={[
                    "h-10 rounded-lg border px-4 font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground hover:bg-brand-primary-hover hover:text-primary-foreground"
                      : "border-border bg-brand-panel text-brand-muted hover:border-primary hover:bg-brand-panel hover:text-foreground",
                  ].join(" ")}
                >
                  {filter.label}
                </Button>
              )
            })}
          </div>
        </div>

        <Card className="surface-card overflow-hidden rounded-lg shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    RFQ ID
                  </TableHead>
                  <TableHead className="min-w-[140px] px-6 py-4 text-brand-muted">
                    Buyer
                  </TableHead>
                  <TableHead className="min-w-[180px] px-6 py-4 text-brand-muted">
                    Vehicle
                  </TableHead>
                  <TableHead className="min-w-[220px] px-6 py-4 text-brand-muted">
                    Part
                  </TableHead>
                  <TableHead className="min-w-[100px] px-6 py-4 text-brand-muted">
                    Quantity
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Deadline
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[130px] px-6 py-4 text-brand-muted">
                    Created
                  </TableHead>
                  <TableHead className="min-w-[100px] px-6 py-4 text-brand-muted">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRfqs.map((rfq) => (
                  <TableRow
                    key={rfq.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-medium text-primary">{rfq.id}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.buyer}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.vehicle}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.part}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.quantity}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span
                        className={
                          rfq.deadline === "1 day"
                            ? "font-semibold text-brand-warning"
                            : "text-brand-muted"
                        }
                      >
                        {rfq.deadline}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {getStatusBadge(rfq.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.created}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.status === "Quoted" ? (
                        <Button
                          disabled
                          className="h-9 rounded-lg bg-brand-panel-strong px-4 text-sm text-brand-muted opacity-100 hover:bg-brand-panel-strong"
                        >
                          Quoted
                        </Button>
                      ) : (
                        <Button className="h-9 rounded-lg px-4 text-sm hover:bg-brand-primary-hover">
                          Quote
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
