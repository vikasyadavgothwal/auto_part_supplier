export type SupplierProfileRecord = {
  id: string
  publicId: string
  supplierPublicId: string | null
  companyName: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  emailVerifiedAt: string | null
  phone: string | null
  tradeLicenseNumber: string | null
  contactPerson: string | null
  designation: string | null
  supplierContactPhone: string | null
  supplierContactPhoneVerifiedAt: string | null
  tradeLicenseImageUrl: string | null
  vatTrnNumber: string | null
  vatTrnImageUrl: string | null
  supplierIdentityDocumentType: string | null
  emiratesIdPassportUrl: string | null
  emiratesIdBackUrl: string | null
  passportAddressUrl: string | null
  passportVisaFrontUrl: string | null
  bankIban: string | null
  bankAccountProofUrl: string | null
  marketplaceAgreementAcceptedAt: string | null
  mobileVerifiedAt: string | null
  avatarUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  country: string | null
  supplierApprovalStatus: string
  supplierApprovalRejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export type SupplierProfileFormValues = {
  companyName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tradeLicenseNumber: string
  contactPerson: string
  designation: string
  supplierContactPhone: string
  tradeLicenseImageUrl: string
  vatTrnNumber: string
  vatTrnImageUrl: string
  supplierIdentityDocumentType: string
  emiratesIdPassportUrl: string
  emiratesIdBackUrl: string
  passportAddressUrl: string
  passportVisaFrontUrl: string
  bankIban: string
  bankAccountProofUrl: string
  marketplaceAgreementAccepted: boolean
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
}

export const emptySupplierProfile: SupplierProfileRecord = {
  id: "",
  publicId: "",
  supplierPublicId: null,
  companyName: null,
  firstName: null,
  lastName: null,
  email: null,
  emailVerifiedAt: null,
  phone: null,
  tradeLicenseNumber: null,
  contactPerson: null,
  designation: null,
  supplierContactPhone: null,
  supplierContactPhoneVerifiedAt: null,
  tradeLicenseImageUrl: null,
  vatTrnNumber: null,
  vatTrnImageUrl: null,
  supplierIdentityDocumentType: null,
  emiratesIdPassportUrl: null,
  emiratesIdBackUrl: null,
  passportAddressUrl: null,
  passportVisaFrontUrl: null,
  bankIban: null,
  bankAccountProofUrl: null,
  marketplaceAgreementAcceptedAt: null,
  mobileVerifiedAt: null,
  avatarUrl: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  country: null,
  supplierApprovalStatus: "Pending",
  supplierApprovalRejectionReason: null,
  createdAt: "",
  updatedAt: "",
}

export const supplierHasSubmittedDocuments = (
  profile: SupplierProfileRecord,
) =>
  Boolean(
    profile.tradeLicenseNumber &&
      profile.tradeLicenseImageUrl &&
      profile.vatTrnNumber &&
      profile.vatTrnImageUrl &&
      profile.supplierIdentityDocumentType &&
      profile.emiratesIdPassportUrl &&
      profile.bankIban &&
      profile.bankAccountProofUrl &&
      profile.marketplaceAgreementAcceptedAt,
  )

export const supplierCanAccessDashboard = (profile: SupplierProfileRecord) =>
  profile.supplierApprovalStatus === "Approved"

export const formFromSupplierProfile = (
  profile: SupplierProfileRecord,
): SupplierProfileFormValues => ({
  companyName: profile.companyName ?? "",
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  email: profile.email ?? "",
  phone: profile.phone ?? "",
  tradeLicenseNumber: profile.tradeLicenseNumber ?? "",
  contactPerson: profile.contactPerson ?? "",
  designation: profile.designation ?? "",
  supplierContactPhone: profile.supplierContactPhone ?? "",
  tradeLicenseImageUrl: profile.tradeLicenseImageUrl ?? "",
  vatTrnNumber: profile.vatTrnNumber ?? "",
  vatTrnImageUrl: profile.vatTrnImageUrl ?? "",
  supplierIdentityDocumentType:
    profile.supplierIdentityDocumentType ?? "emirates_id",
  emiratesIdPassportUrl: profile.emiratesIdPassportUrl ?? "",
  emiratesIdBackUrl: profile.emiratesIdBackUrl ?? "",
  passportAddressUrl: profile.passportAddressUrl ?? "",
  passportVisaFrontUrl: profile.passportVisaFrontUrl ?? "",
  bankIban: profile.bankIban ?? "",
  bankAccountProofUrl: profile.bankAccountProofUrl ?? "",
  marketplaceAgreementAccepted: Boolean(
    profile.marketplaceAgreementAcceptedAt,
  ),
  addressLine1: profile.addressLine1 ?? "",
  addressLine2: profile.addressLine2 ?? "",
  city: profile.city ?? "",
  state: profile.state ?? "",
  country: profile.country ?? "",
})

export const payloadFromSupplierForm = (form: SupplierProfileFormValues) => ({
  companyName: form.companyName.trim(),
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  tradeLicenseNumber: form.tradeLicenseNumber.trim(),
  contactPerson: form.contactPerson.trim(),
  designation: form.designation.trim(),
  supplierContactPhone: form.supplierContactPhone.trim(),
  tradeLicenseImageUrl: form.tradeLicenseImageUrl.trim(),
  vatTrnNumber: form.vatTrnNumber.trim(),
  vatTrnImageUrl: form.vatTrnImageUrl.trim(),
  supplierIdentityDocumentType: form.supplierIdentityDocumentType.trim(),
  emiratesIdPassportUrl: form.emiratesIdPassportUrl.trim(),
  emiratesIdBackUrl: form.emiratesIdBackUrl.trim(),
  passportAddressUrl: form.passportAddressUrl.trim(),
  passportVisaFrontUrl: form.passportVisaFrontUrl.trim(),
  bankIban: form.bankIban.trim(),
  bankAccountProofUrl: form.bankAccountProofUrl.trim(),
  marketplaceAgreementAccepted: form.marketplaceAgreementAccepted,
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  country: form.country.trim(),
})
