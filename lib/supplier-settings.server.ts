import { cookies } from "next/headers"

import { requestBackend } from "@/lib/auth/backend"
import {
  emptySupplierProfile,
  type SupplierProfileRecord,
} from "@/lib/supplier-settings"

type SupplierSettingsPayload = {
  ok: boolean
  profile?: SupplierProfileRecord
}

export async function getSupplierSettings() {
  const response = await requestBackend("/api/v1/supplier/settings", {
    cookieHeader: (await cookies()).toString(),
  })

  if (!response.ok) {
    return emptySupplierProfile
  }

  const payload = (await response.json()) as SupplierSettingsPayload
  return payload.profile ?? emptySupplierProfile
}
