import type { Offer, OfferStat, OfferTip } from "./types"

export const offerStats: readonly OfferStat[] = [
  { label: "Total Offers", value: "3", valueClassName: "text-foreground" },
  { label: "Pending", value: "1", valueClassName: "text-brand-warning" },
  { label: "Accepted", value: "1", valueClassName: "text-primary" },
  { label: "Win Rate", value: "33%", valueClassName: "text-foreground" },
]

export const offers: readonly Offer[] = [
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

export const offerTips: readonly OfferTip[] = [
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
