import { cookies } from "next/headers"
import { SupplierFeatureAccessPage, type BusinessAccess } from "@/components/subscription/feature-access-page"
import { requestBackend } from "@/lib/auth/backend"

type AccessPayload = { ok: boolean; access?: BusinessAccess[] }

export default async function AddOnsPage() {
  const response = await requestBackend("/api/v1/business/access", { cookieHeader: (await cookies()).toString() }).catch(() => null)
  const payload = response?.ok ? ((await response.json()) as AccessPayload) : null
  const access = payload?.access?.find((item) => item.businessAccount.type === "Supplier")
  return <SupplierFeatureAccessPage access={access} area="add-ons" />
}
