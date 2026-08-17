"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/toast-provider"
import { appPath, appRoutes } from "@/lib/routes"

type FeaturedCategory = {
  categoryId: string
  categoryName: string
  parentName?: string | null
  selected?: boolean
}

export function FeaturedCategoryPlanCard({
  categoryLimit,
}: {
  categoryLimit?: number | null
}) {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<FeaturedCategory[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const limitReached = typeof categoryLimit === "number" && categoryLimit >= 0 && selectedIds.length >= categoryLimit
  const limitText = typeof categoryLimit === "number" ? `${selectedIds.length}/${categoryLimit} selected` : `${selectedIds.length} selected`

  useEffect(() => {
    void fetch(appPath("/api/supplier/featured-categories"), { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { categories?: FeaturedCategory[]; selectedBySource?: Record<string, string[]> }) => {
        setCategories(payload.categories ?? [])
        setSelectedIds(payload.selectedBySource?.plan ?? [])
      })
      .catch(() => {
        setCategories([])
        setSelectedIds([])
      })
  }, [])

  async function save() {
    if (!selectedIds.length) {
      showToast({ type: "error", title: "Select category", message: "Select at least one category for Featured Vendor." })
      return
    }
    if (typeof categoryLimit === "number" && categoryLimit >= 0 && selectedIds.length > categoryLimit) {
      showToast({ type: "error", title: "Category limit reached", message: `Your plan allows ${categoryLimit} Featured Vendor categor${categoryLimit === 1 ? "y" : "ies"}.` })
      return
    }
    setSaving(true)
    try {
      const response = await fetch(appPath("/api/supplier/featured-categories"), {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ categoryIds: selectedIds }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || payload?.ok === false) throw new Error(payload?.message ?? "Unable to save categories")
      showToast({ type: "success", title: "Featured categories saved", message: "Featured Vendor now applies to selected categories." })
    } catch (error) {
      showToast({ type: "error", title: "Unable to save categories", message: error instanceof Error ? error.message : "Unable to save categories" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Vendor categories</CardTitle>
        <CardDescription>
          Included with your plan. Select only admin-allowed categories from your active mapped products. {limitText}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {categories.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((category) => (
              <label key={category.categoryId} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
                <Checkbox
                  checked={selectedIds.includes(category.categoryId)}
                  disabled={!selectedIds.includes(category.categoryId) && limitReached}
                  onCheckedChange={(checked) => setSelectedIds((current) => checked ? [...current, category.categoryId] : current.filter((id) => id !== category.categoryId))}
                />
                <span>
                  <span className="font-medium">{category.categoryName}</span>
                  {category.parentName ? <span className="block text-xs text-muted-foreground">{category.parentName}</span> : null}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active mapped product categories found.</p>
        )}
        <Button className="justify-self-start" disabled={saving || !categories.length} onClick={() => void save()}>
          {saving ? "Saving..." : "Save categories"}
        </Button>
        <Button asChild variant="outline" className="justify-self-start">
          <Link href={appRoutes.addOns}>Buy extra category</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
