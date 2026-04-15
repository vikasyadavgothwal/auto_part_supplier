"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Total Offers", value: "3", valueClassName: "text-foreground" },
  { label: "Pending", value: "1", valueClassName: "text-brand-warning" },
  { label: "Accepted", value: "1", valueClassName: "text-primary" },
  { label: "Win Rate", value: "33%", valueClassName: "text-foreground" },
] as const

type OfferStatus = "Pending" | "Accepted" | "Rejected"

type Offer = {
  id: string
  rfqId: string
  buyer: string
  part: string
  qty: string
  price: string
  eta: string
  status: OfferStatus
  submitted: string
}

const offers: Offer[] = [
  {
    id: "OFF-001",
    rfqId: "RFQ-501",
    buyer: "John Doe",
    part: "Brake Pads - Front",
    qty: "1 Set",
    price: "$89.99",
    eta: "2-3 days",
    status: "Pending",
    submitted: "2 hours ago",
  },
  {
    id: "OFF-002",
    rfqId: "RFQ-502",
    buyer: "Jane Smith",
    part: "Oil Filter",
    qty: "5",
    price: "$64.95",
    eta: "1-2 days",
    status: "Accepted",
    submitted: "1 day ago",
  },
  {
    id: "OFF-003",
    rfqId: "RFQ-503",
    buyer: "Mike Johnson",
    part: "Air Filter",
    qty: "10",
    price: "$189.90",
    eta: "3-5 days",
    status: "Rejected",
    submitted: "2 days ago",
  },
]

const tips = [
  {
    title: "Competitive Pricing",
    description:
      "Research market rates and offer competitive prices to increase acceptance.",
  },
  {
    title: "Fast Response",
    description:
      "Respond quickly to RFQs. Early quotes have higher acceptance rates.",
  },
  {
    title: "Accurate ETAs",
    description:
      "Provide realistic delivery timelines that you can consistently meet.",
  },
]

function getStatusBadge(status: OfferStatus) {
  switch (status) {
    case "Pending":
      return (
        <Badge className="border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10">
          Pending
        </Badge>
      )
    case "Accepted":
      return (
        <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10">
          Accepted
        </Badge>
      )
    case "Rejected":
      return (
        <Badge className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10">
          Rejected
        </Badge>
      )
  }
}

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Offers
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Track your quote submissions and win rates.
          </p>
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

        <Card className="surface-card overflow-hidden rounded-lg shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Offer ID
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    RFQ ID
                  </TableHead>
                  <TableHead className="min-w-[150px] px-6 py-4 text-brand-muted">
                    Buyer
                  </TableHead>
                  <TableHead className="min-w-[220px] px-6 py-4 text-brand-muted">
                    Part
                  </TableHead>
                  <TableHead className="min-w-[90px] px-6 py-4 text-brand-muted">
                    Qty
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    Price
                  </TableHead>
                  <TableHead className="min-w-[110px] px-6 py-4 text-brand-muted">
                    ETA
                  </TableHead>
                  <TableHead className="min-w-[120px] px-6 py-4 text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[130px] px-6 py-4 text-brand-muted">
                    Submitted
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {offers.map((offer) => (
                  <TableRow
                    key={offer.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-medium text-primary">{offer.id}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.rfqId}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.buyer}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.part}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.qty}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-foreground">
                        {offer.price}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.eta}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {getStatusBadge(offer.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {offer.submitted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="surface-card rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">
              Improve Your Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tips.map((tip) => (
                <div key={tip.title}>
                  <div className="mb-2 font-semibold text-primary">{tip.title}</div>
                  <p className="text-sm text-brand-muted">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
