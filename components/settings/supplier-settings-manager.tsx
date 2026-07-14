"use client"

import { useState, type FormEvent } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"
import {
  formFromSupplierProfile,
  payloadFromSupplierForm,
  type SupplierProfileFormValues,
  type SupplierProfileRecord,
} from "@/lib/supplier-settings"
import { appBasePath } from "@/lib/routes"

type SupplierSettingsPayload = {
  ok: boolean
  profile?: SupplierProfileRecord
  message?: string
}

const POSTAL_CODE_PATTERN = /^[A-Za-z0-9 -]*$/

const withBasePath = (path: string) => `${appBasePath}${path}`

export function SupplierSettingsManager({
  profile,
}: {
  profile: SupplierProfileRecord
}) {
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [form, setForm] = useState<SupplierProfileFormValues>(
    formFromSupplierProfile(profile),
  )
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const setField = <Key extends keyof SupplierProfileFormValues>(
    key: Key,
    value: SupplierProfileFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const validateForm = () => {
    if (!form.companyName.trim()) return "Company name is required"
    if (form.companyName.trim().length > 160) {
      return "Company name must be 160 characters or fewer"
    }
    if (form.postalCode && !POSTAL_CODE_PATTERN.test(form.postalCode)) {
      return "Postal code contains invalid characters"
    }
    return ""
  }

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    try {
      const response = await authenticatedFetch(
        withBasePath("/api/supplier/settings"),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payloadFromSupplierForm(form)),
        },
      )
      const payload = (await response.json()) as SupplierSettingsPayload
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to save supplier settings")
      }
      setCurrentProfile(payload.profile)
      setForm(formFromSupplierProfile(payload.profile))
      setMessage("Supplier settings saved")
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save supplier settings",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={saveSettings}>
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage supplier profile and address details visible to operations.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-sm border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}
        </p>
      ) : null}

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={form.companyName}
              onChange={(event) => setField("companyName", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ops-email">Operations Email</Label>
            <Input
              id="ops-email"
              type="email"
              value={currentProfile.email ?? ""}
              readOnly
              className="border-border bg-brand-surface/70 text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first-name">Contact First Name</Label>
            <Input
              id="first-name"
              value={form.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-name">Contact Last Name</Label>
            <Input
              id="last-name"
              value={form.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-id">Supplier ID</Label>
            <Input
              id="supplier-id"
              value={currentProfile.supplierPublicId ?? currentProfile.publicId}
              readOnly
              className="border-border bg-brand-surface/70 text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Supplier Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address-line-1">Address Line 1</Label>
            <Input
              id="address-line-1"
              value={form.addressLine1}
              onChange={(event) => setField("addressLine1", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address-line-2">Address Line 2</Label>
            <Input
              id="address-line-2"
              value={form.addressLine2}
              onChange={(event) => setField("addressLine2", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(event) => setField("state", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal-code">Postal Code</Label>
            <Input
              id="postal-code"
              value={form.postalCode}
              onChange={(event) => setField("postalCode", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(event) => setField("country", event.target.value)}
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
