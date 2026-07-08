import type { FilterOption } from "../shared/types"
import type { RfqFilter } from "./types"

export const rfqFilters: readonly FilterOption<RfqFilter>[] = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Expiring", label: "Expiring" },
  { key: "Quoted", label: "Quoted" },
]
