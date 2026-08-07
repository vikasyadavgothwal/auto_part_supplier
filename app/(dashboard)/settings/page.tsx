import { cookies } from "next/headers"

import { SupplierSettingsManager } from "@/components/settings/supplier-settings-manager"
import { AccountSettingsCard } from "@/components/shared/account-settings-card"
import { LoginSecurityCard } from "@/components/shared/login-security-card"
import { ChangePasswordCard } from "@/components/shared/change-password-card"
import { requestBackend } from "@/lib/auth/backend"
import { requireDashboardUser } from "@/lib/auth/server"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

type BusinessAccessPayload = {
  ok: boolean
  access?: Array<{ businessAccount: { type: string; isOwner?: boolean } }>
}

type AccountPayload = {
  ok: boolean
  account?: { firstName: string | null; lastName: string | null; email: string | null }
}

async function getSettingsContext() {
  const cookieHeader = (await cookies()).toString()
  const [accessResponse, accountResponse] = await Promise.all([
    requestBackend("/api/v1/business/access", { cookieHeader }).catch(() => null),
    requestBackend("/api/v1/user/account", { cookieHeader }).catch(() => null),
  ])
  const accessPayload = accessResponse?.ok ? ((await accessResponse.json()) as BusinessAccessPayload) : null
  const accountPayload = accountResponse?.ok ? ((await accountResponse.json()) as AccountPayload) : null
  return {
    isOwner: Boolean(accessPayload?.access?.find((item) => item.businessAccount.type === "Supplier")?.businessAccount.isOwner),
    account: accountPayload?.account ?? null,
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
      ) : null}
      <AccountSettingsCard initialAccount={context.account} />
      <LoginSecurityCard />
      <ChangePasswordCard />
    </div>
  )
}
