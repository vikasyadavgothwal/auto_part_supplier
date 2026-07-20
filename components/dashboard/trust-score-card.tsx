import Link from "next/link"
import {
  CircleCheck,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { appRoutes } from "@/lib/routes"

export function TrustScoreCard({ score, fulfillmentRate, cancellationRate, responseTime }: { score: number; fulfillmentRate: number; cancellationRate: number; responseTime: string }) {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-white">
          Your Trust Score
        </CardTitle>
        <Link
          href={appRoutes.performance}
          className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors"
        >
          View Details
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-yellow-500 text-base">{score}</span>
            <span className="text-xs text-[#9CA3AF]">/ 100</span>
            <TrendingUp className="w-3 h-3 text-green-500" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-sm bg-green-500/10 border border-green-500/20 text-xs px-2 py-1">
            <CircleCheck className="w-3 h-3 text-green-500" />
            <span className="font-medium text-green-500">Synced</span>
            <span className="text-xs text-[#9CA3AF]">• 2 min ago</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-bold text-white">Live</span>
            <span className="text-sm text-[#9CA3AF]">performance</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs px-1.5 py-0.5">
            <CircleCheck className="w-3 h-3 text-green-500" />
            <span className="font-medium text-green-500">Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-[#9CA3AF]">{responseTime}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Response Time</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">{Math.round(fulfillmentRate)}%</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Fulfillment Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">{Math.round(cancellationRate)}%</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Cancellation Rate</p>
          </div>
        </div>

        <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-sm flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Improve your response time by 30 minutes to reach Top Rated
              status!
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Responding faster helps you win more RFQs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
