"use client"

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { FirebaseError } from "firebase/app"
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from "firebase/auth"
import {
  CheckCircle2,
  ImagePlus,
  Mail,
  MessageSquareText,
  Save,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"
import {
  getFirebaseAuth,
  getFirebaseAuthDiagnostics,
  isFirebaseAuthConfigured,
} from "@/lib/auth/firebase-client"
import {
  formFromSupplierProfile,
  payloadFromSupplierForm,
  type SupplierProfileFormValues,
  type SupplierProfileRecord,
} from "@/lib/supplier-settings"

type SupplierSettingsPayload = {
  ok: boolean
  profile?: SupplierProfileRecord
  message?: string
  verificationLink?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PATTERN = /^\+\d{8,18}$/
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9 -]*$/
const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MOBILE_COUNTRY_CODES = [
  { code: "+971", label: "UAE" },
  { code: "+91", label: "India" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+1", label: "United States" },
  { code: "+44", label: "United Kingdom" },
  { code: "+974", label: "Qatar" },
  { code: "+965", label: "Kuwait" },
  { code: "+968", label: "Oman" },
  { code: "+973", label: "Bahrain" },
  { code: "+92", label: "Pakistan" },
] as const
const DEFAULT_MOBILE_COUNTRY_CODE = "+971"

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

const normalizeDigits = (value: string, maxLength = 14) =>
  value.replace(/\D/g, "").slice(0, maxLength)

const parseMobileNumber = (value: string) => {
  const compact = value.replace(/[^\d+]/g, "")
  const countryCode =
    [...MOBILE_COUNTRY_CODES]
      .sort((first, second) => second.code.length - first.code.length)
      .find((country) => compact.startsWith(country.code))?.code ??
    DEFAULT_MOBILE_COUNTRY_CODE
  const localNumber = normalizeDigits(
    compact.startsWith(countryCode)
      ? compact.slice(countryCode.length)
      : compact.replace(/^\+/, ""),
  )

  return { countryCode, localNumber }
}

const buildMobileNumber = (countryCode: string, localNumber: string) => {
  const digits = normalizeDigits(localNumber)
  return digits ? `${countryCode}${digits}` : ""
}

const normalizeMobileValue = (value: string) => {
  const parsed = parseMobileNumber(value)
  return buildMobileNumber(parsed.countryCode, parsed.localNumber)
}

const getFirebasePhoneErrorMessage = (error: unknown) => {
  const diagnostics = getFirebaseAuthDiagnostics()
  const origin =
    diagnostics.origin === "server" ? "this domain" : diagnostics.origin

  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : "Unable to verify mobile number"
  }

  const messages: Record<string, string> = {
    "auth/captcha-check-failed": "Phone verification failed. Try again.",
    "auth/credential-already-in-use":
      "This mobile number is already linked to another account.",
    "auth/invalid-phone-number": "Enter a valid mobile number.",
    "auth/invalid-app-credential":
      `Phone verification is blocked for ${origin}. Add this domain in Firebase Auth Authorized domains and, if your Firebase API key is restricted, add ${origin}/* in Google Cloud API key HTTP referrers.`,
    "auth/invalid-verification-code": "The OTP is incorrect.",
    "auth/missing-verification-code": "Enter the OTP.",
    "auth/operation-not-allowed":
      "Phone authentication is not enabled in Firebase.",
    "auth/quota-exceeded": "Firebase SMS quota is exceeded. Try again later.",
    "auth/too-many-requests": "Too many OTP attempts. Try again later.",
  }

  return messages[error.code] ?? "Unable to verify mobile number"
}

const logFirebasePhoneError = (error: unknown) => {
  if (
    error instanceof FirebaseError &&
    error.code === "auth/invalid-app-credential"
  ) {
    console.warn("Firebase phone auth app verifier rejected", {
      ...getFirebaseAuthDiagnostics(),
      code: error.code,
      message: error.message,
    })
  }
}

const profileDisplayName = (profile: SupplierProfileRecord) =>
  profile.companyName ||
  [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
  profile.email ||
  "Supplier"

const initialsFor = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP"

export function SupplierSettingsManager({
  profile,
}: {
  profile: SupplierProfileRecord
}) {
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null)
  const initialForm = {
    ...formFromSupplierProfile(profile),
    phone: normalizeMobileValue(profile.phone ?? ""),
  }
  const initialMobile = parseMobileNumber(initialForm.phone)
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [form, setForm] = useState<SupplierProfileFormValues>(initialForm)
  const [mobileCountryCode, setMobileCountryCode] = useState<string>(
    initialMobile.countryCode,
  )
  const [mobileLocalNumber, setMobileLocalNumber] = useState(
    initialMobile.localNumber,
  )
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [otp, setOtp] = useState("")
  const [mobileVerificationId, setMobileVerificationId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  useEffect(() => {
    return () => {
      recaptchaVerifier.current?.clear()
      recaptchaVerifier.current = null
    }
  }, [])

  const setField = <Key extends keyof SupplierProfileFormValues>(
    key: Key,
    value: SupplierProfileFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const clearRecaptchaVerifier = () => {
    recaptchaVerifier.current?.clear()
    recaptchaVerifier.current = null
    document.getElementById("supplier-mobile-recaptcha")?.replaceChildren()
  }

  const getRecaptchaVerifier = () => {
    clearRecaptchaVerifier()
    const verifier = new RecaptchaVerifier(
      getFirebaseAuth(),
      "supplier-mobile-recaptcha",
      { size: "invisible" },
    )
    recaptchaVerifier.current = verifier
    return verifier
  }

  const syncProfileForm = (nextProfile: SupplierProfileRecord) => {
    const nextForm = {
      ...formFromSupplierProfile(nextProfile),
      phone: normalizeMobileValue(nextProfile.phone ?? ""),
    }
    const nextMobile = parseMobileNumber(nextForm.phone)
    setForm(nextForm)
    setMobileCountryCode(nextMobile.countryCode)
    setMobileLocalNumber(nextMobile.localNumber)
  }

  const setMobileNumber = (countryCode: string, localNumber: string) => {
    const digits = normalizeDigits(localNumber)
    setMobileCountryCode(countryCode)
    setMobileLocalNumber(digits)
    setField("phone", buildMobileNumber(countryCode, digits))
  }

  const validateForm = () => {
    if (!form.companyName.trim()) return "Company name is required"
    if (form.companyName.trim().length > 160) {
      return "Company name must be 160 characters or fewer"
    }
    if (form.firstName.trim().length > 100 || form.lastName.trim().length > 100) {
      return "Name fields must be 100 characters or fewer"
    }
    if (form.email && !EMAIL_PATTERN.test(form.email)) {
      return "Enter a valid email address"
    }
    if (form.phone && !MOBILE_PATTERN.test(form.phone)) {
      return "Enter a valid mobile number"
    }
    if (form.postalCode && !POSTAL_CODE_PATTERN.test(form.postalCode)) {
      return "Postal code contains invalid characters"
    }
    if (!form.tradeLicenseNumber.trim()) return "Trade license number is required"
    if (!form.contactPerson.trim()) return "Contact person is required"
    if (!form.designation.trim()) return "Designation is required"
    if (!isHttpUrl(form.tradeLicenseImageUrl.trim())) {
      return "Enter a valid trade license image URL"
    }
    if (!form.vatTrnNumber.trim()) return "VAT TRN number is required"
    if (!isHttpUrl(form.vatTrnImageUrl.trim())) {
      return "Enter a valid VAT TRN image URL"
    }
    return ""
  }

  const persistSettings = async () => {
    const response = await authenticatedFetch("/api/supplier/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payloadFromSupplierForm(form)),
    })
    const payload = (await response.json()) as SupplierSettingsPayload
    if (!response.ok || !payload.ok || !payload.profile) {
      throw new Error(payload.message || "Unable to save supplier settings")
    }
    setCurrentProfile(payload.profile)
    syncProfileForm(payload.profile)
    return payload.profile
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
      const pendingEmail = form.email
      const pendingPhone = form.phone
      const pendingMobileCountryCode = mobileCountryCode
      const pendingMobileLocalNumber = mobileLocalNumber
      const emailChanged =
        pendingEmail.trim().toLowerCase() !== (currentProfile.email ?? "")
      const phoneChanged =
        normalizeMobileValue(pendingPhone) !==
        normalizeMobileValue(currentProfile.phone ?? "")
      await persistSettings()
      if (emailChanged || phoneChanged) {
        setForm((current) => ({
          ...current,
          ...(emailChanged ? { email: pendingEmail } : {}),
          ...(phoneChanged ? { phone: pendingPhone } : {}),
        }))
        if (phoneChanged) {
          setMobileCountryCode(pendingMobileCountryCode)
          setMobileLocalNumber(pendingMobileLocalNumber)
        }
      }
      setMessage(
        emailChanged || phoneChanged
          ? "Profile saved. Verify changed email or mobile before it becomes active on your supplier account."
          : "Supplier settings saved",
      )
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

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError("")
    setMessage("")
    if (!AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_SIZE) {
      setError("Image must be JPG, PNG, or WebP and no larger than 5 MB")
      return
    }

    setIsUploadingAvatar(true)
    try {
      const body = new FormData()
      body.append("avatar", file)
      const response = await authenticatedFetch("/api/supplier/settings/avatar", {
        method: "POST",
        body,
      })
      const payload = (await response.json()) as SupplierSettingsPayload
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to upload supplier image")
      }
      setCurrentProfile(payload.profile)
      setMessage("Supplier image updated")
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload supplier image",
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const sendEmailVerification = async () => {
    setError("")
    setMessage("")
    const email = form.email.trim().toLowerCase()
    if (!email) {
      setError("Enter an email before verification")
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address")
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await authenticatedFetch(
        "/api/supplier/settings/email-verification",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        },
      )
      const payload = (await response.json()) as SupplierSettingsPayload
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to send verification link")
      }
      setMessage(
        payload.verificationLink
          ? `${payload.message} ${payload.verificationLink}`
          : payload.message || "Verification link sent",
      )
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send verification link",
      )
    } finally {
      setIsSendingEmail(false)
    }
  }

  const sendMobileOtp = async () => {
    setError("")
    setMessage("")
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    const normalizedPhone = normalizeMobileValue(form.phone)
    if (!normalizedPhone) {
      setError("Enter a mobile number before verification")
      return
    }
    if (!isFirebaseAuthConfigured()) {
      setError("Firebase phone authentication is not configured")
      return
    }

    setIsSendingOtp(true)
    try {
      const checkResponse = await authenticatedFetch(
        "/api/supplier/settings/mobile-otp/check",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: normalizedPhone }),
        },
      )
      const checkPayload = (await checkResponse.json().catch(() => null)) as {
        message?: string
      } | null
      if (!checkResponse.ok) {
        throw new Error(checkPayload?.message || "Unable to check mobile number")
      }

      const provider = new PhoneAuthProvider(getFirebaseAuth())
      let verificationId: string
      try {
        verificationId = await provider.verifyPhoneNumber(
          normalizedPhone,
          getRecaptchaVerifier(),
        )
      } catch (phoneError) {
        clearRecaptchaVerifier()
        throw phoneError
      }
      setMobileVerificationId(verificationId)
      setOtp("")
      setMessage("OTP sent by Firebase")
    } catch (sendError) {
      logFirebasePhoneError(sendError)
      setError(getFirebasePhoneErrorMessage(sendError))
    } finally {
      setIsSendingOtp(false)
    }
  }

  const verifyMobileOtp = async () => {
    setError("")
    setMessage("")
    setIsVerifyingOtp(true)

    try {
      if (!mobileVerificationId) throw new Error("Send OTP first")
      if (!isFirebaseAuthConfigured()) {
        throw new Error("Firebase phone authentication is not configured")
      }
      const credential = PhoneAuthProvider.credential(mobileVerificationId, otp)
      const phoneCredential = await signInWithCredential(
        getFirebaseAuth(),
        credential,
      )
      const firebaseIdToken = await phoneCredential.user.getIdToken(true)

      const response = await authenticatedFetch(
        "/api/supplier/settings/mobile-otp/verify",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ firebaseIdToken }),
        },
      )
      const payload = (await response.json()) as SupplierSettingsPayload
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to verify OTP")
      }

      setCurrentProfile(payload.profile)
      syncProfileForm(payload.profile)
      setOtp("")
      setMobileVerificationId("")
      setMessage("Mobile number verified")
    } catch (verifyError) {
      setError(getFirebasePhoneErrorMessage(verifyError))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const displayName = profileDisplayName(currentProfile)
  const emailVerified =
    Boolean(currentProfile.emailVerifiedAt) &&
    form.email.trim().toLowerCase() === (currentProfile.email ?? "")
  const mobileVerified =
    Boolean(currentProfile.mobileVerifiedAt) &&
    normalizeMobileValue(form.phone) ===
      normalizeMobileValue(currentProfile.phone ?? "")
  const emailChanged =
    form.email.trim().toLowerCase() !== (currentProfile.email ?? "")
  const phoneChanged =
    normalizeMobileValue(form.phone) !==
    normalizeMobileValue(currentProfile.phone ?? "")

  return (
    <form className="space-y-8" onSubmit={saveSettings}>
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage the supplier profile shown to customers on product offer pages.
        </p>
      </div>
      <div id="supplier-mobile-recaptcha" />

      {error ? (
        <p
          role="alert"
          className="break-words rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="break-words rounded-sm border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}
        </p>
      ) : null}

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Public Supplier Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-start gap-4">
            <Avatar className="size-24 rounded-sm" size="lg">
              {currentProfile.avatarUrl ? (
                <AvatarImage
                  src={currentProfile.avatarUrl}
                  alt={displayName}
                  className="rounded-sm"
                />
              ) : null}
              <AvatarFallback className="rounded-sm text-xl">
                {initialsFor(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                id="supplier-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadAvatar}
                disabled={isUploadingAvatar}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingAvatar}
                onClick={() =>
                  document.getElementById("supplier-avatar")?.click()
                }
                className="gap-2"
              >
                <ImagePlus className="size-4" />
                {isUploadingAvatar ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">
            Trade License & VAT Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trade-license-number">Trade License Number</Label>
            <Input
              id="trade-license-number"
              value={form.tradeLicenseNumber}
              onChange={(event) =>
                setField("tradeLicenseNumber", event.target.value)
              }
              className="border-border bg-brand-surface"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-person">Contact Person</Label>
            <Input
              id="contact-person"
              value={form.contactPerson}
              onChange={(event) => setField("contactPerson", event.target.value)}
              className="border-border bg-brand-surface"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={form.designation}
              onChange={(event) => setField("designation", event.target.value)}
              className="border-border bg-brand-surface"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-trn-number">VAT TRN Number</Label>
            <Input
              id="vat-trn-number"
              value={form.vatTrnNumber}
              onChange={(event) => setField("vatTrnNumber", event.target.value)}
              className="border-border bg-brand-surface"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="trade-license-image-url">
              Trade License Image URL
            </Label>
            <Input
              id="trade-license-image-url"
              type="url"
              inputMode="url"
              value={form.tradeLicenseImageUrl}
              onChange={(event) =>
                setField("tradeLicenseImageUrl", event.target.value)
              }
              placeholder="https://example.com/trade-license.jpg"
              className="border-border bg-brand-surface"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vat-trn-image-url">VAT TRN Image URL</Label>
            <Input
              id="vat-trn-image-url"
              type="url"
              inputMode="url"
              value={form.vatTrnImageUrl}
              onChange={(event) => setField("vatTrnImageUrl", event.target.value)}
              placeholder="https://example.com/vat-certificate.jpg"
              className="border-border bg-brand-surface"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Contact Verification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="ops-email">Operations Email</Label>
              {emailVerified ? (
                <Badge className="bg-green-500/10 text-green-400">
                  Verified
                </Badge>
              ) : emailChanged ? (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Needs verification
                </Badge>
              ) : null}
            </div>
            <Input
              id="ops-email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              className="border-border bg-brand-surface"
            />
            {!emailVerified ? (
              <Button
                type="button"
                variant="outline"
                onClick={sendEmailVerification}
                disabled={isSendingEmail}
                className="gap-2"
              >
                <Mail className="size-4" />
                {isSendingEmail ? "Sending..." : "Send verification link"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="phone">Mobile</Label>
              {mobileVerified ? (
                <Badge className="bg-green-500/10 text-green-400">
                  Verified
                </Badge>
              ) : phoneChanged ? (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Needs verification
                </Badge>
              ) : null}
            </div>
            <div className="flex min-w-0">
              <select
                aria-label="Mobile country code"
                value={mobileCountryCode}
                onChange={(event) =>
                  setMobileNumber(event.target.value, mobileLocalNumber)
                }
                className="h-10 w-36 shrink-0 rounded-l-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
              >
                {MOBILE_COUNTRY_CODES.map((country) => (
                  <option
                    key={`${country.code}-${country.label}`}
                    value={country.code}
                  >
                    {country.code} {country.label}
                  </option>
                ))}
              </select>
              <Input
                id="phone"
                type="tel"
                value={mobileLocalNumber}
                onChange={(event) =>
                  setMobileNumber(mobileCountryCode, event.target.value)
                }
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Mobile number"
                className="min-w-0 rounded-l-none border-l-0 border-border bg-brand-surface"
              />
            </div>
            {!mobileVerified ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendMobileOtp}
                  disabled={isSendingOtp}
                  className="gap-2"
                >
                  <MessageSquareText className="size-4" />
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </Button>
                <Input
                  value={otp}
                  onChange={(event) =>
                    setOtp(normalizeDigits(event.target.value, 6))
                  }
                  placeholder="OTP"
                  inputMode="numeric"
                  maxLength={6}
                  className="border-border bg-brand-surface sm:max-w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyMobileOtp}
                  disabled={isVerifyingOtp || !otp.trim()}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Verify
                </Button>
              </div>
            ) : null}
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
