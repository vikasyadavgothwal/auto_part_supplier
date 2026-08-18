"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { FirebaseError } from "firebase/app"
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from "firebase/auth"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  KeyRound,
  Mail,
  MessageSquareText,
  Save,
  Upload,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-provider"
import { authenticatedFetch } from "@/lib/auth/client"
import {
  ensureFirebaseAuthConfigured,
  getFirebaseAuth,
  getFirebaseAuthDiagnostics,
} from "@/lib/auth/firebase-client"
import {
  formFromSupplierProfile,
  payloadFromSupplierForm,
  supplierHasSubmittedDocuments,
  type SupplierProfileFormValues,
  type SupplierProfileRecord,
} from "@/lib/supplier-settings"

type SupplierSettingsPayload = {
  ok: boolean
  profile?: SupplierProfileRecord
  message?: string
  verificationLink?: string
}

type DocumentUploadPayload = {
  ok: boolean
  documentUrl?: string
  message?: string
}

type PendingDocumentUpload = {
  file: File
  kind: string
  fileName: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PATTERN = /^\+\d{8,18}$/
const POSTAL_CODE_PATTERN = /^\d{6}$/
const ADDRESS_LINE_PATTERN = /^[A-Za-z0-9\s.,#'’/&()-]*$/
const PLACE_NAME_PATTERN = /^[A-Za-z\s.'’()-]*$/
const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024
const MAX_PDF_DOCUMENT_SIZE = 10 * 1024 * 1024
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const PDF_DOCUMENT_TYPE = "application/pdf"
const DOCUMENT_TYPES = [...AVATAR_TYPES, PDF_DOCUMENT_TYPE]
const DOCUMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf"
const DOCUMENT_REQUIREMENTS =
  "Images: JPG, PNG, or WebP up to 5 MB. PDFs: up to 10 MB."
const ADDRESS_LIMITS = {
  addressLine1: 255,
  addressLine2: 255,
  city: 120,
  state: 120,
  postalCode: 6,
  country: 120,
} as const
const TRADE_LICENSE_MIN_LENGTH = 6
const TRADE_LICENSE_MAX_LENGTH = 30
const VAT_TRN_MIN_LENGTH = 10
const VAT_TRN_MAX_LENGTH = 20
const BANK_IBAN_MAX_LENGTH = 34
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
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

const normalizeDigits = (value: string, maxLength = 14) =>
  value.replace(/\D/g, "").slice(0, maxLength)

const readJsonResponse = async <T,>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      response.status === 413
        ? "Upload is too large. Choose a smaller file and try again."
        : fallbackMessage,
    )
  }
}

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

const splitFullName = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (!normalized) return { firstName: "", lastName: "" }
  const [firstName, ...rest] = normalized.split(" ")
  return { firstName, lastName: rest.join(" ") }
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

const labelForAddressField = (key: keyof typeof ADDRESS_LIMITS) =>
  ({
    addressLine1: "Address line 1",
    addressLine2: "Address line 2",
    city: "City",
    state: "State",
    postalCode: "Postal code",
    country: "Country",
  })[key]

const documentFieldHasValue = (
  form: SupplierProfileFormValues,
  pendingDocumentUploads: Partial<
    Record<keyof SupplierProfileFormValues, PendingDocumentUpload>
  >,
  field: keyof SupplierProfileFormValues,
) => Boolean(String(form[field] ?? "").trim() || pendingDocumentUploads[field])

type SupplierDocumentField =
  | "tradeLicenseImageUrl"
  | "vatTrnImageUrl"
  | "emiratesIdPassportUrl"
  | "emiratesIdBackUrl"
  | "passportAddressUrl"
  | "passportVisaFrontUrl"
  | "bankAccountProofUrl"

const supplierDocumentUrl = (field: SupplierDocumentField) =>
  `/api/supplier/settings/documents?field=${encodeURIComponent(field)}`

const RequiredMark = () => (
  <span aria-hidden="true" className="text-destructive">
    {" *"}
  </span>
)

const validateDocumentFile = async (file: File) => {
  if (!DOCUMENT_TYPES.includes(file.type)) {
    return DOCUMENT_REQUIREMENTS
  }
  if (file.type === PDF_DOCUMENT_TYPE) {
    return file.size <= MAX_PDF_DOCUMENT_SIZE ? "" : DOCUMENT_REQUIREMENTS
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    return DOCUMENT_REQUIREMENTS
  }

  return ""
}

function DocumentUploadField({
  field,
  kind,
  label,
  value,
  pendingFileName,
  disabled,
  onUpload,
}: {
  field: SupplierDocumentField
  kind: string
  label: string
  value: string
  pendingFileName?: string
  disabled: boolean
  onUpload: (
    field: SupplierDocumentField,
    kind: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void
}) {
  const isRequired = label.endsWith(" *")
  const displayLabel = isRequired ? label.slice(0, -2) : label

  return (
    <div className="rounded-sm border border-border bg-brand-surface/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Label htmlFor={`document-${kind}`} className="text-foreground">
            {displayLabel}
            {isRequired ? <RequiredMark /> : null}
          </Label>
          <p className="text-xs leading-5 text-muted-foreground">
            {DOCUMENT_REQUIREMENTS}
          </p>
        </div>
        <Badge
          variant="outline"
            className={
            value || pendingFileName
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-yellow-500/30 text-yellow-400"
          }
        >
          {pendingFileName ? "Selected" : value ? "Uploaded" : "Required"}
        </Badge>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          id={`document-${kind}`}
          type="file"
          accept={DOCUMENT_ACCEPT}
          onChange={(event) => onUpload(field, kind, event)}
          disabled={disabled}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => document.getElementById(`document-${kind}`)?.click()}
          className="gap-2"
        >
          <Upload className="size-4" />
          {disabled
            ? "Uploading..."
            : value || pendingFileName
              ? "Replace File"
              : "Upload File"}
        </Button>
        {pendingFileName ? (
          <span className="inline-flex min-h-10 min-w-0 items-center rounded-sm border border-border px-4 text-sm text-muted-foreground">
            <span className="truncate">{pendingFileName}</span>
          </span>
        ) : null}
        {value ? (
          <a
            href={supplierDocumentUrl(field)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Open ${label}`}
          >
            <FileText className="size-4" />
            Open File
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function SupplierSettingsManager({
  profile,
}: {
  profile: SupplierProfileRecord
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null)
  const initialForm = {
    ...formFromSupplierProfile(profile),
    phone: normalizeMobileValue(profile.phone ?? ""),
  }
  const initialMobile = parseMobileNumber(initialForm.phone)
  const initialSupplierContactMobile = parseMobileNumber(
    initialForm.supplierContactPhone,
  )
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [form, setForm] = useState<SupplierProfileFormValues>(initialForm)
  const [mobileCountryCode, setMobileCountryCode] = useState<string>(
    initialMobile.countryCode,
  )
  const [mobileLocalNumber, setMobileLocalNumber] = useState(
    initialMobile.localNumber,
  )
  const [supplierContactCountryCode, setSupplierContactCountryCode] =
    useState<string>(initialSupplierContactMobile.countryCode)
  const [supplierContactLocalNumber, setSupplierContactLocalNumber] = useState(
    initialSupplierContactMobile.localNumber,
  )
  const [savingSection, setSavingSection] = useState("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [uploadingDocumentField, setUploadingDocumentField] = useState("")
  const [pendingDocumentUploads, setPendingDocumentUploads] = useState<
    Partial<Record<keyof SupplierProfileFormValues, PendingDocumentUpload>>
  >({})
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [supplierContactOtp, setSupplierContactOtp] = useState("")
  const [supplierContactVerificationId, setSupplierContactVerificationId] =
    useState("")
  const [isSendingSupplierContactOtp, setIsSendingSupplierContactOtp] =
    useState(false)
  const [isVerifyingSupplierContactOtp, setIsVerifyingSupplierContactOtp] =
    useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const setField = <Key extends keyof SupplierProfileFormValues>(
    key: Key,
    value: SupplierProfileFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const showFeedback = (
    type: "success" | "error",
    title: string,
    dialogMessage: string,
  ) => {
    showToast({ type, title, message: dialogMessage })
  }

  const setLimitedField = (
    key: keyof typeof ADDRESS_LIMITS,
    value: string,
  ) => {
    const limit = ADDRESS_LIMITS[key]
    setField(key, value)
    if (value.length > limit) {
      showFeedback("error", "Validation Error", `${labelForAddressField(key)} must be ${limit} characters or fewer`)
    }
  }

  const clearRecaptchaVerifier = () => {
    recaptchaVerifier.current?.clear()
    recaptchaVerifier.current = null
    document.getElementById("supplier-contact-recaptcha")?.replaceChildren()
  }

  const getRecaptchaVerifier = () => {
    clearRecaptchaVerifier()
    const verifier = new RecaptchaVerifier(
      getFirebaseAuth(),
      "supplier-contact-recaptcha",
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
    const nextSupplierContactMobile = parseMobileNumber(
      nextForm.supplierContactPhone,
    )
    setForm(nextForm)
    setMobileCountryCode(nextMobile.countryCode)
    setMobileLocalNumber(nextMobile.localNumber)
    setSupplierContactCountryCode(nextSupplierContactMobile.countryCode)
    setSupplierContactLocalNumber(nextSupplierContactMobile.localNumber)
  }

  const setMobileNumber = (countryCode: string, localNumber: string) => {
    const digits = normalizeDigits(localNumber)
    setMobileCountryCode(countryCode)
    setMobileLocalNumber(digits)
    setField("phone", buildMobileNumber(countryCode, digits))
  }

  const setSupplierContactPhone = (
    countryCode: string,
    localNumber: string,
  ) => {
    const digits = normalizeDigits(localNumber)
    setSupplierContactCountryCode(countryCode)
    setSupplierContactLocalNumber(digits)
    setField("supplierContactPhone", buildMobileNumber(countryCode, digits))
    setSupplierContactVerificationId("")
    setSupplierContactOtp("")
  }

  const validateProfileSection = () => {
    if (!form.companyName.trim()) return "Company name is required"
    if (form.companyName.trim().length > 160) {
      return "Company name must be 160 characters or fewer"
    }
    if (form.firstName.trim().length > 100 || form.lastName.trim().length > 100) {
      return "Full name must be 160 characters or fewer"
    }
    if (form.email && !EMAIL_PATTERN.test(form.email)) {
      return "Enter a valid email address"
    }
    if (
      form.supplierContactPhone &&
      !MOBILE_PATTERN.test(form.supplierContactPhone)
    ) {
      return "Enter a valid supplier contact number"
    }
    if (
      normalizeMobileValue(form.supplierContactPhone) !==
      normalizeMobileValue(currentProfile.supplierContactPhone ?? "")
    ) {
      return "Verify the supplier contact number with OTP before saving"
    }
    return ""
  }

  const validateAuthorizedContactSection = () => {
    if (!form.contactPerson.trim()) return "Authorized person name is required"
    if (!form.designation.trim()) return "Designation is required"
    if (form.phone && !MOBILE_PATTERN.test(form.phone)) {
      return "Enter a valid authorized phone number"
    }
    return ""
  }

  const validateAddressSection = () => {
    if (!form.addressLine1.trim()) return "Address line 1 is required"
    if (!form.city.trim()) return "City is required"
    if (!form.state.trim()) return "State is required"
    if (!form.postalCode.trim()) return "Postal code is required"
    if (!form.country.trim()) return "Country is required"
    for (const [key, limit] of Object.entries(ADDRESS_LIMITS)) {
      const value = form[key as keyof typeof ADDRESS_LIMITS]
      if (value.length > limit) {
        return `${labelForAddressField(key as keyof typeof ADDRESS_LIMITS)} must be ${limit} characters or fewer`
      }
      if (/[\r\n\t]/.test(value)) {
        return `${labelForAddressField(key as keyof typeof ADDRESS_LIMITS)} cannot contain multiple lines or tabs`
      }
    }
    if (form.addressLine1 && !ADDRESS_LINE_PATTERN.test(form.addressLine1)) {
      return "Address line 1 contains invalid characters"
    }
    if (form.addressLine2 && !ADDRESS_LINE_PATTERN.test(form.addressLine2)) {
      return "Address line 2 contains invalid characters"
    }
    if (form.city && !PLACE_NAME_PATTERN.test(form.city)) {
      return "City contains invalid characters"
    }
    if (form.state && !PLACE_NAME_PATTERN.test(form.state)) {
      return "State contains invalid characters"
    }
    if (form.country && !PLACE_NAME_PATTERN.test(form.country)) {
      return "Country contains invalid characters"
    }
    if (form.postalCode && !POSTAL_CODE_PATTERN.test(form.postalCode)) {
      return "Postal code must be exactly 6 digits"
    }
    return ""
  }

  const validateDocumentsSection = () => {
    if (!form.tradeLicenseNumber.trim()) return "Trade license number is required"
    if (
      form.tradeLicenseNumber.trim().length < TRADE_LICENSE_MIN_LENGTH ||
      form.tradeLicenseNumber.trim().length > TRADE_LICENSE_MAX_LENGTH
    ) {
      return `Trade license number must be ${TRADE_LICENSE_MIN_LENGTH}-${TRADE_LICENSE_MAX_LENGTH} characters`
    }
    if (
      !documentFieldHasValue(
        form,
        pendingDocumentUploads,
        "tradeLicenseImageUrl",
      )
    ) {
      return "Upload a valid trade license document"
    }
    if (!form.vatTrnNumber.trim()) return "VAT TRN number is required"
    if (
      form.vatTrnNumber.trim().length < VAT_TRN_MIN_LENGTH ||
      form.vatTrnNumber.trim().length > VAT_TRN_MAX_LENGTH
    ) {
      return `VAT TRN must be ${VAT_TRN_MIN_LENGTH}-${VAT_TRN_MAX_LENGTH} characters`
    }
    if (
      !documentFieldHasValue(form, pendingDocumentUploads, "vatTrnImageUrl")
    ) {
      return "Upload a valid VAT registration document"
    }
    if (
      form.supplierIdentityDocumentType !== "emirates_id" &&
      form.supplierIdentityDocumentType !== "passport"
    ) {
      return "Choose Emirates ID or Passport as identity document"
    }
    if (
      !documentFieldHasValue(
        form,
        pendingDocumentUploads,
        "emiratesIdPassportUrl",
      )
    ) {
      return form.supplierIdentityDocumentType === "passport"
        ? "Upload passport photo page"
        : "Upload Emirates ID front photo"
    }
    if (
      form.supplierIdentityDocumentType === "emirates_id" &&
      !documentFieldHasValue(form, pendingDocumentUploads, "emiratesIdBackUrl")
    ) {
      return "Upload Emirates ID back photo"
    }
    if (
      form.supplierIdentityDocumentType === "passport" &&
      !documentFieldHasValue(form, pendingDocumentUploads, "passportAddressUrl")
    ) {
      return "Upload passport address page"
    }
    if (
      form.supplierIdentityDocumentType === "passport" &&
      !documentFieldHasValue(
        form,
        pendingDocumentUploads,
        "passportVisaFrontUrl",
      )
    ) {
      return "Upload passport visa front photo"
    }
    if (!form.bankIban.trim()) return "Bank Account IBAN is required"
    if (form.bankIban.trim().length > BANK_IBAN_MAX_LENGTH) {
      return `Bank Account IBAN must be ${BANK_IBAN_MAX_LENGTH} characters or fewer`
    }
    if (
      !documentFieldHasValue(form, pendingDocumentUploads, "bankAccountProofUrl")
    ) {
      return "Upload a valid bank account proof document"
    }
    if (!form.marketplaceAgreementAccepted) {
      return "Accept the marketplace agreement before saving"
    }
    return ""
  }

  const validateSection = (section: string) => {
    if (section === "profile") return validateProfileSection()
    if (section === "authorized-contact") return validateAuthorizedContactSection()
    if (section === "documents") return validateDocumentsSection()
    if (section === "address") return validateAddressSection()
    return ""
  }

  const persistSettings = async (formOverride = form) => {
    const response = await authenticatedFetch("/api/supplier/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payloadFromSupplierForm(formOverride)),
    })
    const payload = (await response.json()) as SupplierSettingsPayload
    if (!response.ok || !payload.ok || !payload.profile) {
      throw new Error(payload.message || "Unable to save supplier settings")
    }
    setCurrentProfile(payload.profile)
    syncProfileForm(payload.profile)
    return payload.profile
  }

  const uploadPendingDocuments = async () => {
    const entries = Object.entries(pendingDocumentUploads) as Array<
      [keyof SupplierProfileFormValues, PendingDocumentUpload]
    >
    if (entries.length === 0) return form

    let nextForm = form
    for (const [field, pendingUpload] of entries) {
      setUploadingDocumentField(String(field))
      const body = new FormData()
      body.append("document", pendingUpload.file)
      body.append("kind", pendingUpload.kind)
      const response = await authenticatedFetch(
        "/api/supplier/settings/documents",
        { method: "POST", body },
      )
      const payload = await readJsonResponse<DocumentUploadPayload>(
        response,
        "Unable to upload document",
      )
      if (!response.ok || !payload.ok || !payload.documentUrl) {
        throw new Error(payload.message || "Unable to upload document")
      }
      nextForm = { ...nextForm, [field]: payload.documentUrl }
    }

    setForm(nextForm)
    setPendingDocumentUploads({})
    setUploadingDocumentField("")
    return nextForm
  }

  const saveSection = async (section: string, successMessage: string) => {
    const validationError = validateSection(section)
    if (validationError) {
      showFeedback("error", "Validation Error", validationError)
      return
    }

    setSavingSection(section)
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
      const formToSave =
        section === "documents" ? await uploadPendingDocuments() : form
      const savedProfile = await persistSettings(formToSave)
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
      showFeedback(
        "success",
        "Settings Saved",
        emailChanged
          ? "Profile saved. Verify the changed operations email before it becomes active on your supplier account."
          : section === "documents" &&
              savedProfile.supplierApprovalStatus === "Pending"
            ? "Verification documents submitted. Admin will review your supplier profile before dashboard tools are unlocked."
          : successMessage,
      )
      router.refresh()
    } catch (saveError) {
      showFeedback(
        "error",
        "Unable To Save",
        saveError instanceof Error
          ? saveError.message
          : "Unable to save supplier settings",
      )
    } finally {
      setSavingSection("")
      setUploadingDocumentField("")
    }
  }

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_SIZE) {
      showFeedback(
        "error",
        "Upload Error",
        "Image must be JPG, PNG, or WebP and no larger than 5 MB",
      )
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
      const payload = await readJsonResponse<SupplierSettingsPayload>(
        response,
        "Unable to upload supplier image",
      )
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to upload supplier image")
      }
      setCurrentProfile(payload.profile)
      syncProfileForm(payload.profile)
      showFeedback(
        "success",
        "Image Updated",
        "Supplier image saved to your profile",
      )
      router.refresh()
    } catch (uploadError) {
      showFeedback(
        "error",
        "Upload Error",
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload supplier image",
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const uploadDocument = async (
    field: keyof SupplierProfileFormValues,
    kind: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const validationError = await validateDocumentFile(file)
    if (validationError) {
      showFeedback(
        "error",
        "Upload Error",
        validationError,
      )
      return
    }

    setPendingDocumentUploads((current) => ({
      ...current,
      [field]: { file, kind, fileName: file.name },
    }))
    showFeedback(
      "success",
      "Document Selected",
      "Document will upload when you save documents.",
    )
  }

  const changePassword = async () => {
    const currentPassword = passwordForm.currentPassword
    const newPassword = passwordForm.newPassword
    if (!currentPassword) {
      showFeedback("error", "Validation Error", "Current password is required")
      return
    }
    if (!passwordForm.confirmPassword) {
      showFeedback("error", "Validation Error", "Confirm password is required")
      return
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
      showFeedback(
        "error",
        "Validation Error",
        `New password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
      )
      return
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      showFeedback(
        "error",
        "Validation Error",
        "New password must include uppercase, lowercase, and number characters",
      )
      return
    }
    if (newPassword === currentPassword) {
      showFeedback("error", "Validation Error", "New password must be different from current password")
      return
    }
    if (newPassword !== passwordForm.confirmPassword) {
      showFeedback("error", "Validation Error", "New passwords do not match")
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await authenticatedFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const payload = (await response.json()) as { message?: string; ok?: boolean }
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to change password")
      }
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      showFeedback(
        "success",
        "Password Changed",
        payload.message || "Password changed successfully",
      )
    } catch (passwordError) {
      showFeedback(
        "error",
        "Unable To Change Password",
        passwordError instanceof Error
          ? passwordError.message
          : "Unable to change password",
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  const sendEmailVerification = async () => {
    const email = form.email.trim().toLowerCase()
    if (!email) {
      showFeedback("error", "Validation Error", "Enter an email before verification")
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      showFeedback("error", "Validation Error", "Enter a valid email address")
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
      showFeedback(
        "success",
        "Verification Link Sent",
        payload.verificationLink
          ? `${payload.message} ${payload.verificationLink}`
          : payload.message || "Verification link sent",
      )
    } catch (sendError) {
      showFeedback(
        "error",
        "Unable To Send",
        sendError instanceof Error
          ? sendError.message
          : "Unable to send verification link",
      )
    } finally {
      setIsSendingEmail(false)
    }
  }

  const sendSupplierContactOtp = async () => {
    const normalizedPhone = normalizeMobileValue(form.supplierContactPhone)
    if (!normalizedPhone) {
      showFeedback(
        "error",
        "Validation Error",
        "Enter a supplier contact number before verification",
      )
      return
    }
    if (!MOBILE_PATTERN.test(normalizedPhone)) {
      showFeedback("error", "Validation Error", "Enter a valid supplier contact number")
      return
    }
    setIsSendingSupplierContactOtp(true)
    try {
      if (!(await ensureFirebaseAuthConfigured())) {
        showFeedback(
          "error",
          "OTP Unavailable",
          "Firebase phone authentication is not configured",
        )
        return
      }

      const checkResponse = await authenticatedFetch(
        "/api/supplier/settings/mobile-otp/check",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            phone: normalizedPhone,
            target: "supplierContactPhone",
          }),
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
      setSupplierContactVerificationId(verificationId)
      setSupplierContactOtp("")
      showFeedback("success", "OTP Sent", "OTP sent to supplier contact number")
    } catch (sendError) {
      logFirebasePhoneError(sendError)
      showFeedback("error", "Unable To Send OTP", getFirebasePhoneErrorMessage(sendError))
    } finally {
      setIsSendingSupplierContactOtp(false)
    }
  }

  const verifySupplierContactOtp = async () => {
    if (!/^\d{6}$/.test(supplierContactOtp)) {
      showFeedback("error", "Validation Error", "Enter the 6-digit OTP")
      return
    }

    setIsVerifyingSupplierContactOtp(true)

    try {
      if (!supplierContactVerificationId) throw new Error("Send OTP first")
      if (!(await ensureFirebaseAuthConfigured())) {
        throw new Error("Firebase phone authentication is not configured")
      }
      const credential = PhoneAuthProvider.credential(
        supplierContactVerificationId,
        supplierContactOtp,
      )
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
          body: JSON.stringify({
            firebaseIdToken,
            target: "supplierContactPhone",
          }),
        },
      )
      const payload = (await response.json()) as SupplierSettingsPayload
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to verify OTP")
      }

      setCurrentProfile(payload.profile)
      syncProfileForm(payload.profile)
      setSupplierContactOtp("")
      setSupplierContactVerificationId("")
      clearRecaptchaVerifier()
      showFeedback(
        "success",
        "Number Verified",
        "Supplier contact number verified",
      )
    } catch (verifyError) {
      showFeedback(
        "error",
        "Unable To Verify OTP",
        getFirebasePhoneErrorMessage(verifyError),
      )
    } finally {
      setIsVerifyingSupplierContactOtp(false)
    }
  }

  const displayName = profileDisplayName(currentProfile)
  const hasSubmittedDocuments = supplierHasSubmittedDocuments(currentProfile)
  const approvalStatus = currentProfile.supplierApprovalStatus
  const emailVerified =
    Boolean(currentProfile.emailVerifiedAt || currentProfile.email) &&
    form.email.trim().toLowerCase() === (currentProfile.email ?? "")
  const emailChanged =
    form.email.trim().toLowerCase() !== (currentProfile.email ?? "")
  const supplierContactPhoneVerified =
    Boolean(currentProfile.supplierContactPhoneVerifiedAt) &&
    normalizeMobileValue(form.supplierContactPhone) ===
      normalizeMobileValue(currentProfile.supplierContactPhone ?? "")
  const supplierContactPhoneChanged =
    normalizeMobileValue(form.supplierContactPhone) !==
    normalizeMobileValue(currentProfile.supplierContactPhone ?? "")
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage the supplier profile shown to customers on product offer pages.
        </p>
      </div>
      <div id="supplier-contact-recaptcha" />

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Public Supplier Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[18rem_1fr]">
          <div className="flex h-full min-h-72 rounded-sm border border-border bg-brand-surface/70 p-4">
            <div className="flex w-full flex-col gap-4 text-center">
              <Avatar className="!h-auto !w-full min-h-44 flex-1 rounded-sm" size="lg">
                {currentProfile.avatarUrl ? (
                  <AvatarImage
                    src={currentProfile.avatarUrl}
                    alt={displayName}
                    className="h-full w-full rounded-sm object-cover"
                  />
                ) : null}
                <AvatarFallback className="h-full w-full rounded-sm text-4xl">
                  {initialsFor(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-1">
                <p className="break-words font-medium leading-6 text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended logo image: square JPG, PNG, or WebP up to 5 MB.
                </p>
              </div>
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
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name<RequiredMark /></Label>
              <Input
                id="company-name"
                value={form.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
                placeholder="Enter company name"
                maxLength={160}
                className="border-border bg-brand-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={[form.firstName, form.lastName].filter(Boolean).join(" ")}
                onChange={(event) => {
                  const nextName = splitFullName(event.target.value)
                  setForm((current) => ({
                    ...current,
                    firstName: nextName.firstName,
                    lastName: nextName.lastName,
                  }))
                }}
                placeholder="Enter full name"
                maxLength={160}
                className="border-border bg-brand-surface"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3 md:max-w-xl">
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
                    Pending verification
                  </Badge>
                ) : null}
              </div>
              <Input
                id="ops-email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value.slice(0, 254))}
                autoComplete="email"
                placeholder="operations@example.com"
                maxLength={254}
                className="border-border bg-brand-surface md:max-w-xl"
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
                  {isSendingEmail ? "Sending..." : "Send Verification Link"}
                </Button>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3 md:max-w-xl">
                <Label htmlFor="supplier-contact-phone">
                  Supplier Contact Number
                </Label>
                {supplierContactPhoneVerified ? (
                  <Badge className="bg-green-500/10 text-green-400">
                    Verified
                  </Badge>
                ) : supplierContactPhoneChanged ? (
                  <Badge
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400"
                  >
                    OTP required
                  </Badge>
                ) : null}
              </div>
              <div className="flex min-w-0 md:max-w-xl">
                <select
                  aria-label="Supplier contact country code"
                  value={supplierContactCountryCode}
                  onChange={(event) =>
                    setSupplierContactPhone(
                      event.target.value,
                      supplierContactLocalNumber,
                    )
                  }
                  className="h-10 w-28 shrink-0 rounded-l-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
                >
                  {MOBILE_COUNTRY_CODES.map((country) => (
                    <option
                      key={`${country.code}-${country.label}`}
                      value={country.code}
                    >
                      {country.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="supplier-contact-phone"
                  type="tel"
                  value={supplierContactLocalNumber}
                  onChange={(event) =>
                    setSupplierContactPhone(
                      supplierContactCountryCode,
                      event.target.value,
                    )
                  }
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Customer-facing contact number"
                  className="h-10 min-w-0 rounded-l-none border-l-0 border-border bg-brand-surface"
                />
              </div>
              {!supplierContactPhoneVerified ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendSupplierContactOtp}
                    disabled={isSendingSupplierContactOtp}
                    className="gap-2"
                  >
                    <MessageSquareText className="size-4" />
                    {isSendingSupplierContactOtp ? "Sending..." : "Send OTP"}
                  </Button>
                  <Input
                    value={supplierContactOtp}
                    onChange={(event) =>
                      setSupplierContactOtp(normalizeDigits(event.target.value, 6))
                    }
                    placeholder="OTP"
                    inputMode="numeric"
                    maxLength={6}
                    className="border-border bg-brand-surface sm:max-w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifySupplierContactOtp}
                    disabled={
                      isVerifyingSupplierContactOtp ||
                      !/^\d{6}$/.test(supplierContactOtp)
                    }
                    className="gap-2"
                  >
                    {isVerifyingSupplierContactOtp ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Send OTP, enter the 6-digit code, then verify this customer-facing number before saving.
              </p>
            </div>

            <div className="md:col-span-2">
              <Button
                type="button"
                disabled={savingSection === "profile" || supplierContactPhoneChanged}
                onClick={() =>
                  void saveSection("profile", "Public supplier profile saved")
                }
                className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
              >
                <Save className="size-4" />
                {savingSection === "profile" ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {approvalStatus !== "Approved" ? (
        <Alert
          variant={approvalStatus === "Rejected" ? "destructive" : "default"}
          className="border-border bg-brand-panel"
        >
          <AlertCircle className="size-4" />
          <AlertTitle>
            {approvalStatus === "Rejected"
              ? "Documents need correction"
              : hasSubmittedDocuments
                ? "Documents waiting for admin review"
                : "Supplier documents required"}
          </AlertTitle>
          <AlertDescription>
            {approvalStatus === "Rejected"
              ? currentProfile.supplierApprovalRejectionReason ||
                "Admin rejected your documents. Update the required files and save documents again for review."
              : hasSubmittedDocuments
                ? "Your supplier documents are submitted. Admin will verify your profile before dashboard tools are unlocked."
                : "Upload all required verification documents and accept the marketplace agreement to submit your profile for admin review."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Authorized Contact</CardTitle>
          <p className="text-sm text-muted-foreground">
            This person appears in Admin as the supplier authorized contact.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="authorized-contact-person">
              Authorized Person Name<RequiredMark />
            </Label>
            <Input
              id="authorized-contact-person"
              value={form.contactPerson}
              onChange={(event) => setField("contactPerson", event.target.value)}
                placeholder="Enter authorized person name"
                maxLength={160}
                className="border-border bg-brand-surface"
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorized-designation">Designation<RequiredMark /></Label>
            <Input
              id="authorized-designation"
              value={form.designation}
              onChange={(event) => setField("designation", event.target.value)}
                placeholder="Enter designation"
                maxLength={120}
                className="border-border bg-brand-surface"
              />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Authorized Person Phone Number</Label>
            <div className="flex min-w-0 md:max-w-xl">
              <select
                aria-label="Mobile country code"
                value={mobileCountryCode}
                onChange={(event) =>
                  setMobileNumber(event.target.value, mobileLocalNumber)
                }
                className="h-10 w-28 shrink-0 rounded-l-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
              >
                {MOBILE_COUNTRY_CODES.map((country) => (
                  <option
                    key={`${country.code}-${country.label}`}
                    value={country.code}
                  >
                    {country.code}
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
                className="h-10 min-w-0 rounded-l-none border-l-0 border-border bg-brand-surface"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Button
              type="button"
              disabled={savingSection === "authorized-contact"}
              onClick={() =>
                void saveSection(
                  "authorized-contact",
                  "Authorized contact saved",
                )
              }
              className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              <Save className="size-4" />
              {savingSection === "authorized-contact"
                ? "Saving..."
                : "Save Contact"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">
            Verification Documents
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These documents are reviewed by Admin before dashboard tools are unlocked.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="space-y-2">
              <Label htmlFor="trade-license-number">Trade License Number<RequiredMark /></Label>
              <Input
                id="trade-license-number"
                value={form.tradeLicenseNumber}
                onChange={(event) =>
                  setField("tradeLicenseNumber", event.target.value)
                }
                placeholder="Enter trade license number"
                minLength={TRADE_LICENSE_MIN_LENGTH}
                maxLength={TRADE_LICENSE_MAX_LENGTH}
                className="border-border bg-brand-surface"
              />
            </div>
            <DocumentUploadField
              field="tradeLicenseImageUrl"
              kind="trade-license"
              label="Trade License Document *"
              value={form.tradeLicenseImageUrl}
              pendingFileName={
                pendingDocumentUploads.tradeLicenseImageUrl?.fileName
              }
              disabled={uploadingDocumentField === "tradeLicenseImageUrl"}
              onUpload={uploadDocument}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="space-y-2">
              <Label htmlFor="vat-trn-number">VAT TRN Number<RequiredMark /></Label>
              <Input
                id="vat-trn-number"
                value={form.vatTrnNumber}
                onChange={(event) => setField("vatTrnNumber", event.target.value)}
                placeholder="Enter VAT TRN"
                minLength={VAT_TRN_MIN_LENGTH}
                maxLength={VAT_TRN_MAX_LENGTH}
                className="border-border bg-brand-surface"
              />
            </div>
            <DocumentUploadField
              field="vatTrnImageUrl"
              kind="vat"
              label="VAT Certificate Document *"
              value={form.vatTrnImageUrl}
              pendingFileName={pendingDocumentUploads.vatTrnImageUrl?.fileName}
              disabled={uploadingDocumentField === "vatTrnImageUrl"}
              onUpload={uploadDocument}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="space-y-2">
              <Label htmlFor="identity-document-type">Identity Document<RequiredMark /></Label>
              <select
                id="identity-document-type"
                value={form.supplierIdentityDocumentType}
                onChange={(event) =>
                  setField("supplierIdentityDocumentType", event.target.value)
                }
                className="h-10 w-full rounded-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
              >
                <option value="emirates_id">Emirates ID</option>
                <option value="passport">Passport</option>
              </select>
            </div>
            <div className="grid gap-4">
              {form.supplierIdentityDocumentType === "passport" ? (
                <>
                  <DocumentUploadField
                    field="emiratesIdPassportUrl"
                    kind="passport-main"
                    label="Passport Photo Page *"
                    value={form.emiratesIdPassportUrl}
                    pendingFileName={
                      pendingDocumentUploads.emiratesIdPassportUrl?.fileName
                    }
                    disabled={uploadingDocumentField === "emiratesIdPassportUrl"}
                    onUpload={uploadDocument}
                  />
                  <DocumentUploadField
                    field="passportAddressUrl"
                    kind="passport-address"
                    label="Passport Address Page *"
                    value={form.passportAddressUrl}
                    pendingFileName={
                      pendingDocumentUploads.passportAddressUrl?.fileName
                    }
                    disabled={uploadingDocumentField === "passportAddressUrl"}
                    onUpload={uploadDocument}
                  />
                  <DocumentUploadField
                    field="passportVisaFrontUrl"
                    kind="passport-visa-front"
                    label="Visa Front Photo *"
                    value={form.passportVisaFrontUrl}
                    pendingFileName={
                      pendingDocumentUploads.passportVisaFrontUrl?.fileName
                    }
                    disabled={uploadingDocumentField === "passportVisaFrontUrl"}
                    onUpload={uploadDocument}
                  />
                </>
              ) : (
                <>
                  <DocumentUploadField
                    field="emiratesIdPassportUrl"
                    kind="emirates-id-front"
                    label="Emirates ID Front *"
                    value={form.emiratesIdPassportUrl}
                    pendingFileName={
                      pendingDocumentUploads.emiratesIdPassportUrl?.fileName
                    }
                    disabled={uploadingDocumentField === "emiratesIdPassportUrl"}
                    onUpload={uploadDocument}
                  />
                  <DocumentUploadField
                    field="emiratesIdBackUrl"
                    kind="emirates-id-back"
                    label="Emirates ID Back *"
                    value={form.emiratesIdBackUrl}
                    pendingFileName={
                      pendingDocumentUploads.emiratesIdBackUrl?.fileName
                    }
                    disabled={uploadingDocumentField === "emiratesIdBackUrl"}
                    onUpload={uploadDocument}
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="space-y-2">
              <Label htmlFor="bank-iban">Bank Account IBAN<RequiredMark /></Label>
              <Input
                id="bank-iban"
                value={form.bankIban}
                onChange={(event) => setField("bankIban", event.target.value)}
                placeholder="Enter IBAN, maximum 34 characters"
                maxLength={BANK_IBAN_MAX_LENGTH}
                className="border-border bg-brand-surface"
              />
            </div>
            <DocumentUploadField
              field="bankAccountProofUrl"
              kind="bank-account-proof"
              label="Bank Account Proof *"
              value={form.bankAccountProofUrl}
              pendingFileName={
                pendingDocumentUploads.bankAccountProofUrl?.fileName
              }
              disabled={uploadingDocumentField === "bankAccountProofUrl"}
              onUpload={uploadDocument}
            />
          </div>

          <div className="flex items-center gap-3 rounded-sm border border-border p-4">
            <Checkbox
              id="marketplace-agreement"
              checked={form.marketplaceAgreementAccepted}
              onCheckedChange={(checked) =>
                setField("marketplaceAgreementAccepted", checked === true)
              }
              className="size-5 border-primary bg-brand-surface"
            />
            <Label
              htmlFor="marketplace-agreement"
              className="leading-relaxed text-foreground"
            >
              I accept the Marketplace Agreement<RequiredMark />
            </Label>
          </div>
          <div>
            <Button
              type="button"
              disabled={savingSection === "documents"}
              onClick={() =>
                void saveSection("documents", "Verification documents saved")
              }
              className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              <Save className="size-4" />
              {savingSection === "documents"
                ? "Saving..."
                : "Save Documents"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password<RequiredMark /></Label>
            <div className="relative">
              <Input
                id="current-password"
                type={passwordVisibility.currentPassword ? "text" : "password"}
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                maxLength={128}
                placeholder="Enter current password"
                className="border-border bg-brand-surface pr-11"
              />
              <button
                type="button"
                aria-label={
                  passwordVisibility.currentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                onClick={() =>
                  setPasswordVisibility((current) => ({
                    ...current,
                    currentPassword: !current.currentPassword,
                  }))
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {passwordVisibility.currentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password<RequiredMark /></Label>
            <div className="relative">
              <Input
                id="new-password"
                type={passwordVisibility.newPassword ? "text" : "password"}
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                maxLength={128}
                placeholder="Enter new password"
                className="border-border bg-brand-surface pr-11"
              />
              <button
                type="button"
                aria-label={
                  passwordVisibility.newPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                onClick={() =>
                  setPasswordVisibility((current) => ({
                    ...current,
                    newPassword: !current.newPassword,
                  }))
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {passwordVisibility.newPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password<RequiredMark /></Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={passwordVisibility.confirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                maxLength={128}
                placeholder="Confirm new password"
                className="border-border bg-brand-surface pr-11"
              />
              <button
                type="button"
                aria-label={
                  passwordVisibility.confirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() =>
                  setPasswordVisibility((current) => ({
                    ...current,
                    confirmPassword: !current.confirmPassword,
                  }))
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {passwordVisibility.confirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="md:col-span-3">
            <Button
              type="button"
              variant="outline"
              disabled={isChangingPassword}
              onClick={changePassword}
              className="gap-2 border-primary bg-primary text-destructive-foreground hover:border-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
            >
              <KeyRound className="size-4" />
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Supplier Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address-line-1">Address Line 1<RequiredMark /></Label>
            <Input
              id="address-line-1"
              value={form.addressLine1}
              onChange={(event) =>
                setLimitedField("addressLine1", event.target.value)
              }
              maxLength={ADDRESS_LIMITS.addressLine1 + 1}
              placeholder="Enter address line 1"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address-line-2">Address Line 2</Label>
            <Input
              id="address-line-2"
              value={form.addressLine2}
              onChange={(event) =>
                setLimitedField("addressLine2", event.target.value)
              }
              maxLength={ADDRESS_LIMITS.addressLine2 + 1}
              placeholder="Enter address line 2"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City<RequiredMark /></Label>
            <Input
              id="city"
              value={form.city}
              onChange={(event) => setLimitedField("city", event.target.value)}
              maxLength={ADDRESS_LIMITS.city + 1}
              placeholder="Enter city"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State<RequiredMark /></Label>
            <Input
              id="state"
              value={form.state}
              onChange={(event) => setLimitedField("state", event.target.value)}
              maxLength={ADDRESS_LIMITS.state + 1}
              placeholder="Enter state or emirate"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal-code">Postal Code<RequiredMark /></Label>
            <Input
              id="postal-code"
              value={form.postalCode}
              onChange={(event) =>
                setField("postalCode", normalizeDigits(event.target.value, 6))
              }
              inputMode="numeric"
              maxLength={ADDRESS_LIMITS.postalCode}
              placeholder="Enter 6 digit postal code"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country<RequiredMark /></Label>
            <Input
              id="country"
              value={form.country}
              onChange={(event) => setLimitedField("country", event.target.value)}
              maxLength={ADDRESS_LIMITS.country + 1}
              placeholder="Enter country"
              className="border-border bg-brand-surface"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="button"
              disabled={savingSection === "address"}
              onClick={() => void saveSection("address", "Supplier address saved")}
              className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              <Save className="size-4" />
              {savingSection === "address" ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
