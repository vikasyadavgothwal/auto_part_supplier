import { cookies } from "next/headers"

import { RfqInboxPageContent } from "@/components/rfq-inbox/rfq-inbox-page-content"
import type { Rfq, RfqPagination } from "@/components/rfq-inbox/types"
import { requestBackend } from "@/lib/auth/backend"

type BackendRfq = {
  id: string
  publicId: string
  companyName: string
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleTrim: string | null
  vehicleVin: string | null
  responseDeadline: string
  createdAt: string
  projectName: string
  description: string | null
  deliveryRequirement: string
  paymentTerms: string
  parts: Array<{
    id: string
    vehicleVin: string | null
    partName: string
    partNumber: string | null
    quantity: number
    notes: string | null
  }>
  bids: Array<{
    id: string
    totalAmount: number
    deliveryDays: number
    partType: string
    validUntil: string | null
    notes: string | null
    status: "submitted" | "accepted" | "rejected" | "withdrawn"
    items: Array<{
      id: string
      rfqPartId: string
      unitPrice: number
      lineTotal: number
      partType: string
      deliveryOption: string
    }>
  }>
}

export default async function RfqInboxPage() {
  let rfqs: Rfq[] = []
  let pagination: RfqPagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 }
  try {
    const response = await requestBackend("/api/v1/rfqs?page=1&pageSize=10", {
      cookieHeader: (await cookies()).toString(),
    })
    const payload = (await response.json()) as { ok: boolean; rfqs?: BackendRfq[]; pagination?: RfqPagination }
    if (response.ok && payload.ok) {
      pagination = payload.pagination ?? pagination
      const responseTime = new Date(response.headers.get("date") ?? 0).getTime()
      rfqs = (payload.rfqs ?? []).map((rfq) => {
        const myBid = rfq.bids[0] ?? null
        const expiresIn = new Date(rfq.responseDeadline).getTime() - responseTime
        return {
          id: rfq.id,
          publicId: rfq.publicId,
          buyer: rfq.companyName,
          vehicle: new Set(rfq.parts.map((part) => part.vehicleVin).filter(Boolean)).size > 1 ? `${new Set(rfq.parts.map((part) => part.vehicleVin).filter(Boolean)).size} vehicles` : [rfq.vehicleYear, rfq.vehicleMake, rfq.vehicleModel, rfq.vehicleTrim].filter(Boolean).join(" ") || "Not specified",
          vehicleVin: rfq.vehicleVin,
          part: rfq.parts.length === 1 ? rfq.parts[0].partName : `${rfq.parts.length} parts`,
          quantity: String(rfq.parts.reduce((sum, part) => sum + part.quantity, 0)),
          deadline: new Date(rfq.responseDeadline).toLocaleDateString("en-AE"),
          responseDeadline: rfq.responseDeadline,
          status: myBid ? "Quoted" : expiresIn <= 2 * 24 * 60 * 60 * 1000 ? "Expiring" : "New",
          created: new Date(rfq.createdAt).toLocaleDateString("en-AE"),
          projectName: rfq.projectName,
          description: rfq.description,
          deliveryRequirement: rfq.deliveryRequirement,
          paymentTerms: rfq.paymentTerms,
          parts: rfq.parts,
          myBid,
        }
      })
    }
  } catch {}
  return <RfqInboxPageContent initialRfqs={rfqs} initialPagination={pagination} />
}
