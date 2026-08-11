import { cookies } from "next/headers"

import { SupplierSettingsManager } from "@/components/settings/supplier-settings-manager"
import { ChangePasswordCard } from "@/components/shared/change-password-card"
import { requestBackend } from "@/lib/auth/backend"
import { requireDashboardUser } from "@/lib/auth/server"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

type BusinessAccessPayload = {
  ok: boolean
  access?: Array<{ businessAccount: { type: string; isOwner?: boolean } }>
}

async function getSettingsContext() {
  const cookieHeader = (await cookies()).toString()
  const accessResponse = await requestBackend("/api/v1/business/access", { cookieHeader }).catch(() => null)
  const accessPayload = accessResponse?.ok ? ((await accessResponse.json()) as BusinessAccessPayload) : null
  return {
    isOwner: Boolean(accessPayload?.access?.find((item) => item.businessAccount.type === "Supplier")?.businessAccount.isOwner),
  }
}

export default async function SettingsPage() {
  const [user, context] = await Promise.all([requireDashboardUser("Supplier"), getSettingsContext()])
  const profile = context.isOwner ? await getSupplierSettings() : null

  return (
    <div className="space-y-8">
      {profile ? (
        <SupplierSettingsManager
          profile={{
            ...profile,
            id: profile.id || user.id,
            email: profile.email ?? user.email,
            phone: profile.phone ?? user.phone,
            firstName: profile.firstName ?? user.firstName,
            lastName: profile.lastName ?? user.lastName,
            companyName: profile.companyName ?? user.companyName,
            avatarUrl: profile.avatarUrl ?? user.avatarUrl,
          }}
        />
      ) : (
        <ChangePasswordCard />
      )}
    </div>
  )
}
