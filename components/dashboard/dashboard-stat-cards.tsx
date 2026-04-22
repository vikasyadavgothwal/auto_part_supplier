import { Card, CardContent } from "@/components/ui/card"

import type { DashboardStat } from "./types"

type DashboardStatCardsProps = {
  stats: readonly DashboardStat[]
}

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card
            key={stat.label}
            className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#DC2626] transition-all cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-[#9CA3AF]">
                  {stat.label}
                </p>
                <div className="p-2 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-sm">
                  <Icon className="w-5 h-5 text-[#DC2626]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </p>
              <p
                className={`text-sm ${
                  stat.neutral ? "text-[#9CA3AF]" : "text-[#DC2626]"
                }`}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
