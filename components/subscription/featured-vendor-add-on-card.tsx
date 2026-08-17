"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

type PriceFields = { pricingModel?: string; priceAmount?: number; priceCurrency?: string; validityDays?: number }
type AddOnRequest = PriceFields & { id: string; featureKey: string; label: string; status: string; validFrom?: string | null; validUntil?: string | null }
type FeaturedCategory = { categoryId: string; categoryName: string; parentName?: string | null; priceAmount: number; priceCurrency: string; validityDays: number }
type Feature = PriceFields & { key: string; label: string }

const featuredDurationOptions = [30, 60, 90, 180, 365]
const categoryPageSize = 5
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC", year: "numeric" })
const activeAddOnStatuses = new Set(["Approved", "Enabled"])
const formatMoney = (amount = 0, currency = "AED") => `${currency} ${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatValidity = (days?: number) => days ? `${days} day${days === 1 ? "" : "s"}` : "Validity not set"
const formatValidUntil = (value?: string | null) => value ? `Valid till ${dateFormatter.format(new Date(value))}` : "Validity not set"
const cleanFeaturedDuration = (value: string) => {
  const days = Number(value)
  return Number.isInteger(days) && days > 0 && days <= 3650 ? days : 30
}
const featuredCategoryPriceForDays = (category: FeaturedCategory, days: number) =>
  Math.round((category.priceAmount * days) / category.validityDays)
const isAddOnCurrentlyActive = (request?: Pick<AddOnRequest, "status" | "validFrom" | "validUntil"> | null) => {
  if (!request || !activeAddOnStatuses.has(request.status)) return false
  const now = Date.now()
  if (request.validFrom && new Date(request.validFrom).getTime() > now) return false
  return !request.validUntil || new Date(request.validUntil).getTime() > now
}
const addOnStatusLabel = (request?: Pick<AddOnRequest, "status" | "validFrom" | "validUntil"> | null) =>
  isAddOnCurrentlyActive(request) ? "Already added" : request?.status === "Requested" ? "Request sent" : request?.status === "Rejected" ? "Rejected" : request?.status && activeAddOnStatuses.has(request.status) ? "Expired" : request?.status ?? "Available"

export function FeaturedVendorAddOnCard({
  addOns,
  categories,
  feature,
  pendingKey,
  selectedCategoryIds,
  setSelectedCategoryIds,
  onRequest,
}: {
  addOns: AddOnRequest[]
  categories: FeaturedCategory[]
  feature: Feature
  pendingKey: string | null
  selectedCategoryIds: string[]
  setSelectedCategoryIds: (updater: (current: string[]) => string[]) => void
  onRequest: (featureKey: string, validityDays: number) => void
}) {
  const [categoryPage, setCategoryPage] = useState(0)
  const [categorySearch, setCategorySearch] = useState("")
  const [validityDays, setValidityDays] = useState("30")
  const validityDaysNumber = cleanFeaturedDuration(validityDays)
  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase()
    if (!query) return categories
    return categories.filter((category) => `${category.categoryName} ${category.parentName ?? ""}`.toLowerCase().includes(query))
  }, [categories, categorySearch])
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / categoryPageSize))
  const safePage = Math.min(categoryPage, totalPages - 1)
  const pageCategories = filteredCategories.slice(safePage * categoryPageSize, safePage * categoryPageSize + categoryPageSize)
  const request = addOns.find((item) => item.featureKey === feature.key)
  const active = isAddOnCurrentlyActive(request)
  const waiting = request?.status === "Requested"
  const selectedCategories = categories.filter((category) => selectedCategoryIds.includes(category.categoryId))
  const totalPrice = selectedCategories.reduce((total, category) => total + featuredCategoryPriceForDays(category, validityDaysNumber), 0)
  const currency = selectedCategories[0]?.priceCurrency ?? categories[0]?.priceCurrency ?? feature.priceCurrency
  const startRow = filteredCategories.length ? safePage * categoryPageSize + 1 : 0
  const endRow = Math.min((safePage + 1) * categoryPageSize, filteredCategories.length)

  return (
    <Card className="md:col-span-2">
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-lg">{feature.label}</CardTitle>
          <CardDescription>Buy Featured Vendor placement for categories outside your plan benefit.</CardDescription>
        </div>
        <div className="rounded-md border border-border bg-background px-4 py-3 text-sm md:min-w-52 md:text-right">
          <p className="font-semibold text-foreground">{formatMoney(totalPrice, currency)}</p>
          <p className="text-xs text-muted-foreground">{formatValidity(validityDaysNumber)} · {selectedCategoryIds.length} selected</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{active ? "Available for more categories" : addOnStatusLabel(request)}{request ? ` · ${formatValidUntil(request.validUntil)}` : ""}</span>
          <Button className="shrink-0" disabled={pendingKey === feature.key || waiting || !selectedCategoryIds.length} onClick={() => onRequest(feature.key, validityDaysNumber)}>
            {pendingKey === feature.key ? "Adding..." : waiting ? "Request sent" : request?.status === "Rejected" ? "Add again" : "Add Add-on"}
          </Button>
        </div>
        <div className="grid gap-4 rounded-md border border-border bg-background p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_280px] lg:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={categorySearch}
                onChange={(event) => {
                  setCategorySearch(event.target.value.slice(0, 80))
                  setCategoryPage(0)
                }}
                maxLength={80}
                placeholder="Search category"
                className="h-10 pl-9"
              />
            </div>
            <div className="grid gap-1 text-sm">
              <label htmlFor="featured-vendor-duration" className="font-medium">Duration <span className="text-primary">*</span></label>
              <select
                id="featured-vendor-duration"
                value={validityDays}
                onChange={(event) => setValidityDays(event.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {featuredDurationOptions.map((days) => (
                  <option key={days} value={String(days)}>{formatValidity(days)}</option>
                ))}
              </select>
            </div>
          </div>
          {pageCategories.length ? (
            <>
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <div className="grid grid-cols-[44px_minmax(180px,1fr)_minmax(120px,220px)_110px] border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  <span />
                  <span>Category</span>
                  <span>Parent</span>
                  <span className="text-right">Price</span>
                </div>
                {pageCategories.map((category) => (
                  <label key={category.categoryId} className="grid cursor-pointer grid-cols-[44px_minmax(180px,1fr)_minmax(120px,220px)_110px] items-center border-b border-border px-3 py-3 text-sm last:border-b-0 hover:bg-muted/30">
                    <Checkbox
                      checked={selectedCategoryIds.includes(category.categoryId)}
                      onCheckedChange={(checked) => setSelectedCategoryIds((current) => checked ? Array.from(new Set([...current, category.categoryId])) : current.filter((id) => id !== category.categoryId))}
                    />
                    <span className="font-medium text-foreground">{category.categoryName}</span>
                    <span className="truncate text-xs text-muted-foreground">{category.parentName ?? "Root category"}</span>
                    <span className="text-right text-xs font-medium text-foreground">{formatMoney(featuredCategoryPriceForDays(category, validityDaysNumber), category.priceCurrency)}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <Button type="button" variant="outline" size="sm" disabled={safePage <= 0} onClick={() => setCategoryPage((page) => Math.max(0, page - 1))}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span>Showing {startRow}-{endRow} of {filteredCategories.length}</span>
                <Button type="button" variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setCategoryPage((page) => Math.min(totalPages - 1, page + 1))}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{categorySearch.trim() ? "No categories match this search." : "No active mapped product categories found."}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
