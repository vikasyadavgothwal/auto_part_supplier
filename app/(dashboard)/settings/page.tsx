import { SupplierSettingsManager } from "@/components/settings/supplier-settings-manager"
import { requireDashboardUser } from "@/lib/auth/server"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([
    requireDashboardUser("Supplier"),
    getSupplierSettings(),
  ])

  return (
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
  )
}
