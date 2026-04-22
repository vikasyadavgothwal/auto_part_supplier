import { Funnel } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { FilterOption } from "./types"

type FilterBarProps<TFilter extends string> = {
  filters: readonly FilterOption<TFilter>[]
  activeFilter: TFilter
  onFilterChange: (filter: TFilter) => void
}

export function FilterBar<TFilter extends string>({
  filters,
  activeFilter,
  onFilterChange,
}: FilterBarProps<TFilter>) {
  return (
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
              onClick={() => onFilterChange(filter.key)}
              className={[
                "h-10 rounded-sm border px-4 font-medium transition-all",
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
  )
}
