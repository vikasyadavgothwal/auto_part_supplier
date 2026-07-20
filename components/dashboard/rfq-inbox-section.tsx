import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { appRoutes } from "@/lib/routes"

import { RfqStatusBadge } from "./dashboard-status-badges"
import type { DashboardRfq } from "./types"

type RfqInboxSectionProps = {
  rfqs: readonly DashboardRfq[]
}

const headers = [
  "RFQ ID",
  "Vehicle",
  "Part",
  "Quantity",
  "Deadline",
  "Status",
  "Action",
] as const

export function RfqInboxSection({ rfqs }: RfqInboxSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">RFQ Inbox</h2>
        <Link
          href={appRoutes.rfqInbox}
          className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] py-0">
        <div className="overflow-x-auto">
          <Table >
            <TableHeader>
              <TableRow className="border-[#2A2A2A] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="text-[#9CA3AF] font-semibold text-center"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#9CA3AF]">No open RFQs available.</TableCell></TableRow>
              ) : null}
              {rfqs.map((rfq) => (
                <TableRow
                  key={rfq.id}
                  className="border-[#2A2A2A] hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                >
                  <TableCell className="text-[#9CA3AF] text-center">{rfq.id}</TableCell>
                  <TableCell className="text-[#9CA3AF] text-center">
                    {rfq.vehicle}
                  </TableCell>
                  <TableCell className="text-[#9CA3AF] text-center">{rfq.part}</TableCell>
                  <TableCell className="text-[#9CA3AF] text-center">{rfq.qty}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        rfq.deadlineUrgent
                          ? "text-red-500 font-semibold"
                          : "text-[#9CA3AF]"
                      }
                    >
                      {rfq.deadline}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <RfqStatusBadge status={rfq.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button asChild size="sm" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-sm px-4">
                      <Link href={appRoutes.rfqInbox}>{rfq.status === "Quoted" ? "Update" : "Quote"}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
