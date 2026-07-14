export type SupplierProfileRecord = {
  id: string
  publicId: string
  supplierPublicId: string | null
  companyName: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  supplierApprovalStatus: string
  createdAt: string
  updatedAt: string
}

export type SupplierProfileFormValues = {
  companyName: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
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
  phone: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
  supplierApprovalStatus: "Pending",
  createdAt: "",
  updatedAt: "",
}

export const formFromSupplierProfile = (
  profile: SupplierProfileRecord,
): SupplierProfileFormValues => ({
  companyName: profile.companyName ?? "",
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  phone: profile.phone ?? "",
  addressLine1: profile.addressLine1 ?? "",
  addressLine2: profile.addressLine2 ?? "",
  city: profile.city ?? "",
  state: profile.state ?? "",
  postalCode: profile.postalCode ?? "",
  country: profile.country ?? "",
})

export const payloadFromSupplierForm = (form: SupplierProfileFormValues) => ({
  companyName: form.companyName.trim(),
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  phone: form.phone.trim(),
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  postalCode: form.postalCode.trim(),
  country: form.country.trim(),
})
