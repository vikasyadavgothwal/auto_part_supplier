export type LiveOrder = {
  id: string
  publicId: string
  source: "rfq" | "direct"
  totalAmount: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  buyer: {
    id: string
    companyName: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    activeRole: string
  }
  supplier: {
    id: string
    companyName: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
  }
  items: Array<{
    id: string
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number | null
    lineTotal: number | null
  }>
  rfq: {
    publicId: string
    projectName: string
    deliveryRequirement: string
    paymentTerms: string
    vehicleVin: string | null
    vehicleYear: number | null
    vehicleMake: string | null
    vehicleModel: string | null
    vehicleTrim: string | null
  } | null
}

export type OrderPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type OrderSummary = {
  totalOrders: number
  totalAmount: number
  byStatus: Record<string, number>
}
