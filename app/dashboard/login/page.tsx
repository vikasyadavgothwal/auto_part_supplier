import { LoginForm } from "@/components/auth/login"
import { getSiteBranding } from "@/lib/site-branding"

export default async function DashboardLoginPage() {
  return <LoginForm branding={await getSiteBranding()} />
}
