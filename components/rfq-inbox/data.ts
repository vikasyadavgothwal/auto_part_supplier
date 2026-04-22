import type { FilterOption } from "../shared/types"
import type { Rfq, RfqFilter, RfqStat } from "./types"

export const rfqStats: readonly RfqStat[] = [
  { label: "Total RFQs", value: "5", valueClassName: "text-foreground" },
  { label: "New", value: "2", valueClassName: "text-brand-info" },
  { label: "Expiring Soon", value: "2", valueClassName: "text-brand-warning" },
  { label: "Quoted", value: "1", valueClassName: "text-brand-success" },
]

export const rfqs: readonly Rfq[] = [
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

export const rfqFilters: readonly FilterOption<RfqFilter>[] = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Expiring", label: "Expiring" },
  { key: "Quoted", label: "Quoted" },
]
