import { cookies } from "next/headers"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BillingPrice } from "@/components/plans/billing-price"
import { ChangePlanButton } from "@/components/plans/change-plan-button"
import { FeaturedCategoryPlanCard } from "@/components/plans/featured-category-plan-card"
import { PaymentHistoryTable } from "@/components/plans/payment-history-table"
import { requestBackend } from "@/lib/auth/backend"

type BusinessPlan = {
  id: string
  code: "Free" | "Pro" | "Enterprise"
  accountType: "Fleet" | "Garage" | "Supplier"
  name: string
  description: string | null
  price: { amount: number; yearlyAmount: number; currency: string; billingPeriod: string; monthlyBillingDays?: number }
  securityTier?: string
  supportTier?: string
  loginSecurityMode?: string
  reportLevel?: "dashboard" | "standard" | "premium"
  apiAccessLevel?: string
  limits: { staff: number | null; roles: number | null; products: number | null; brands: number | null; categories: number | null; rfqs: number | null; orders: number | null }
  reports?: { dashboard: boolean; usage: boolean; activity: boolean }
  support?: { priority: boolean }
  marketplace?: { featuredVendor: boolean; featuredVendorCategoryLimit: number | null; allowedCategoryIds?: string[]; searchBoostLevel: number }
  enabledFeatures: string[]
}

type ActiveAddOn = { id: string; label: string; featureKey: string; status: string; validFrom?: string | null; validUntil?: string | null; renewalAt?: string | null }
type BusinessAccess = {
  businessAccount: { id: string; type?: string; plan: BusinessPlan; usage?: { staff?: number; products?: number; brands?: number; categories?: number; rfqs?: number; orders?: number } }
  activeAddOns?: ActiveAddOn[]
  paymentTransactions?: PaymentTransaction[]
  entitlements?: { activeAddOns?: ActiveAddOn[] }
}
type AccessPayload = { ok: boolean; access?: BusinessAccess[] }
type PlansPayload = { ok: boolean; plans?: BusinessPlan[] }
type PaymentTransaction = { id: string; type: string; sourceId?: string | null; sourceKey?: string | null; description: string; amount: number; currency: string; status: string; createdAt: string; effectiveAt?: string | null; toPlanName?: string | null }
type TransactionsPayload = { ok: boolean; transactions?: PaymentTransaction[] }

const limitText = (value: number | null | undefined) => value == null ? "Unlimited" : String(value)
const reportText = (plan: BusinessPlan) => plan.reportLevel === "premium" ? "Premium analytics" : plan.reportLevel === "standard" ? "Dashboard, usage, activity" : plan.reports?.activity ? "Dashboard, usage, activity" : plan.reports?.usage ? "Dashboard and usage" : "Dashboard"
const securityText = (plan: BusinessPlan) => plan.securityTier ? `${plan.securityTier} (${plan.loginSecurityMode === "otp" ? "OTP" : "Password"})` : plan.code === "Enterprise" ? "Premium (OTP)" : plan.code === "Pro" ? "Standard (OTP)" : "Basic (Password)"
const supportText = (plan: BusinessPlan) => plan.supportTier ?? (plan.support?.priority ? "Premium" : plan.code === "Pro" ? "Standard" : "Basic")
const apiText = (plan: BusinessPlan) => plan.apiAccessLevel === "enterprise" ? "Enterprise" : plan.apiAccessLevel === "standard" ? "Standard" : "Not included"
const isLimitReached = (used: number | null | undefined, limit: number | null | undefined) => limit != null && used != null && used >= limit
const toNumber = (value: number | undefined) => typeof value === "number" ? value : 0
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC", year: "numeric" })
const planRank = { Free: 0, Pro: 1, Enterprise: 2 } as const
const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not set"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not set"
  return dateFormatter.format(date)
}
const isSamePlan = (plan: BusinessPlan, currentPlan: BusinessPlan | undefined) =>
  Boolean(currentPlan && ((plan.id && currentPlan.id && plan.id === currentPlan.id) || (plan.code === currentPlan.code && plan.accountType === currentPlan.accountType)))
const isSupplierAccess = (item: BusinessAccess) =>
  item.businessAccount.type === "Supplier" || item.businessAccount.plan.accountType === "Supplier"

async function readPlanData() {
  const cookieHeader = (await cookies()).toString()
  const [accessResponse, plansResponse] = await Promise.all([requestBackend("/api/v1/business/access", { cookieHeader }), requestBackend("/api/v1/public/business/plans")])
  const accessPayload = accessResponse.ok ? ((await accessResponse.json()) as AccessPayload) : { ok: false }
  const plansPayload = plansResponse.ok ? ((await plansResponse.json()) as PlansPayload) : { ok: false }
  const access = accessPayload.access?.find(isSupplierAccess)
  const transactionsResponse = access ? await requestBackend(`/api/v1/business/transactions?businessAccountId=${encodeURIComponent(access.businessAccount.id)}`, { cookieHeader }) : null
  const transactionsPayload = transactionsResponse?.ok ? ((await transactionsResponse.json()) as TransactionsPayload) : { ok: false }
  return { access, plans: (plansPayload.plans ?? []).filter((plan) => plan.accountType === "Supplier"), transactions: access?.paymentTransactions ?? transactionsPayload.transactions ?? [] }
}

export async function PlansPage() {
  const { access, plans, transactions } = await readPlanData()
  const currentPlan = access?.businessAccount.plan
  const usage = access?.businessAccount.usage
  const activeAddOns = access?.activeAddOns ?? access?.entitlements?.activeAddOns ?? []
  const scheduledChange = transactions.find((item) => item.type === "plan" && item.status === "Scheduled")
  const usageCards = currentPlan ? [{ label: "Staff", value: toNumber(usage?.staff), limit: currentPlan.limits.staff }, { label: "Products", value: toNumber(usage?.products), limit: currentPlan.limits.products }, { label: "Brands", value: toNumber(usage?.brands), limit: currentPlan.limits.brands }, { label: "Categories", value: toNumber(usage?.categories), limit: currentPlan.limits.categories }, { label: "RFQs", value: toNumber(usage?.rfqs), limit: currentPlan.limits.rfqs }, { label: "Orders", value: toNumber(usage?.orders), limit: currentPlan.limits.orders }] : []
  const reachedLimits = usageCards.filter((item) => isLimitReached(item.value, item.limit))

  return <div className="space-y-6">
    {currentPlan ? <section className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Current plan</p><h2 className="mt-2 text-2xl font-semibold">{currentPlan.name}</h2><p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p></div>{currentPlan.code !== "Free" ? <div className="text-left sm:text-right"><BillingPrice code={currentPlan.code} currency={currentPlan.price.currency} monthlyAmount={currentPlan.price.amount} yearlyAmount={currentPlan.price.yearlyAmount} /><p className="mt-1 text-xs text-emerald-500">Active subscription</p></div> : null}</div>{reachedLimits.length ? <p className="mt-3 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-sm text-amber-200">Usage has reached plan limits for: {reachedLimits.map((item) => item.label).join(", ")}. Ask admin for a higher plan.</p> : null}</section> : null}
    {scheduledChange ? <Card className="border-amber-500/30 bg-amber-500/10"><CardContent className="pt-6"><p className="font-semibold text-amber-600">Downgrade scheduled</p><p className="mt-1 text-sm text-muted-foreground">Your current plan remains active until {formatDate(scheduledChange.effectiveAt)}. {scheduledChange.toPlanName ?? "The smaller plan"} activates automatically after that.</p></CardContent></Card> : null}
    {currentPlan?.marketplace?.featuredVendor ? (
      <FeaturedCategoryPlanCard
        categoryLimit={currentPlan.marketplace.featuredVendorCategoryLimit}
      />
    ) : null}
    {currentPlan?.code !== "Enterprise" ? <Card>
      <CardHeader>
        <CardTitle>Active add-ons</CardTitle>
        <CardDescription>Permissions enabled by admin for this Supplier account, with expiry and renewal dates.</CardDescription>
      </CardHeader>
      <CardContent>
        {activeAddOns.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {activeAddOns.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-medium">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.featureKey}</p></div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">{item.status}</Badge>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div><dt className="text-muted-foreground">Valid from</dt><dd className="mt-1 font-medium">{formatDate(item.validFrom)}</dd></div>
                  <div><dt className="text-muted-foreground">Expires</dt><dd className="mt-1 font-medium">{formatDate(item.validUntil)}</dd></div>
                  <div><dt className="text-muted-foreground">Renewal</dt><dd className="mt-1 font-medium">{formatDate(item.renewalAt)}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        ) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No active add-ons for this account.</p>}
      </CardContent>
    </Card> : null}
    <section className="grid gap-4 lg:grid-cols-3">{plans.map((plan) => { const isCurrent = isSamePlan(plan, currentPlan); const isDowngrade = Boolean(currentPlan && planRank[plan.code] < planRank[currentPlan.code]); return <div key={plan.id} className={`rounded-lg border bg-card p-5 shadow-sm ${isCurrent ? "border-primary" : "border-border"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{plan.name}</h2><p className="mt-1 text-sm text-muted-foreground">{plan.description}</p></div>{isCurrent ? <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">Current</span> : null}</div>{plan.code !== "Free" ? <div className="mt-4"><BillingPrice code={plan.code} currency={plan.price.currency} monthlyAmount={plan.price.amount} yearlyAmount={plan.price.yearlyAmount} /></div> : null}<dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Staff</dt><dd>{limitText(plan.limits.staff)}</dd></div><div><dt className="text-muted-foreground">Roles</dt><dd>{limitText(plan.limits.roles)}</dd></div><div><dt className="text-muted-foreground">Products</dt><dd>{limitText(plan.limits.products)}</dd></div><div><dt className="text-muted-foreground">Brands</dt><dd>{limitText(plan.limits.brands)}</dd></div><div><dt className="text-muted-foreground">Categories</dt><dd>{limitText(plan.limits.categories)}</dd></div><div><dt className="text-muted-foreground">RFQs</dt><dd>{limitText(plan.limits.rfqs)}</dd></div><div><dt className="text-muted-foreground">Orders</dt><dd>{limitText(plan.limits.orders)}</dd></div><div><dt className="text-muted-foreground">Reports</dt><dd>{reportText(plan)}</dd></div><div><dt className="text-muted-foreground">Login security</dt><dd>{securityText(plan)}</dd></div><div><dt className="text-muted-foreground">Support</dt><dd>{supportText(plan)}</dd></div><div><dt className="text-muted-foreground">API access</dt><dd>{apiText(plan)}</dd></div></dl>{isCurrent ? <Button className="mt-5 w-full" variant="secondary" disabled>Current Plan</Button> : currentPlan && access ? <ChangePlanButton businessAccountId={access.businessAccount.id} currentPlanName={currentPlan.name} planId={plan.id} planName={plan.name} isDowngrade={isDowngrade} actionLabel={isDowngrade ? "Downgrade Plan" : "Upgrade Plan"} /> : <Button className="mt-5 w-full" variant="secondary" disabled>Plan unavailable</Button>}</div> })}</section>
    <PaymentHistoryTable accountLabel="Supplier" transactions={transactions} showEffectiveDate />
  </div>
}
