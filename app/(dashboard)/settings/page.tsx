import { SupplierSettingsManager } from "@/components/settings/supplier-settings-manager"
import { getSupplierSettings } from "@/lib/supplier-settings.server"

export default async function SettingsPage() {
  const profile = await getSupplierSettings()

  return <SupplierSettingsManager profile={profile} />
}
