import { CircleCheck, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { Integration } from "./types"

type IntegrationStatusCardProps = {
  integrations: readonly Integration[]
}

export function IntegrationStatusCard({
  integrations,
}: IntegrationStatusCardProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DC2626]/10 rounded-sm flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#DC2626]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                </div>
              </div>

              {item.status === "syncing" ? (
                <div className="inline-flex items-center gap-2 rounded-sm bg-blue-500/10 border border-blue-500/20 text-xs px-2 py-1">
                  <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-sm bg-green-500/10 border border-green-500/20 text-xs px-2 py-1">
                  <CircleCheck className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-[#9CA3AF]">• {item.time}</span>
                </div>
              )}
            </div>
          )
        })}

        <Button
          variant="outline"
          className="w-full mt-2 border-[#2A2A2A] text-white hover:border-[#DC2626] hover:bg-[#DC2626]/10 transition-all bg-transparent"
        >
          Manage Integrations
        </Button>
      </CardContent>
    </Card>
  )
}
