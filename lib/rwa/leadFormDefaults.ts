/** Last 10 digits if valid Indian mobile; else "" */
export function normalizeIndianMobile10(input: string | null | undefined): string {
  if (!input?.trim()) return ""
  const digits = input.replace(/\D/g, "")
  const last10 = digits.slice(-10)
  return /^[6-9]\d{9}$/.test(last10) ? last10 : ""
}

/** Build default gym-details values from CF-created Lead fields (society + contact). */
export function buildGymDetailsDefaultsFromLead(args: {
  societyName: string
  contactName: string
  contactEmail: string
  contactPhone?: string | null
}): {
  gymSetupType: "NEW_GYM" | "EXISTING_GYM"
  name: string
  address: string
  city: string
  pincode: string
  capacity: number | undefined
  gymSqFt: number | "" | undefined
  rwaName: string
  totalUnits: number | undefined
  contactPersonName: string
  contactPersonPhone: string
  contactPersonEmail: string
} {
  const phone = normalizeIndianMobile10(args.contactPhone)
  return {
    gymSetupType: "NEW_GYM",
    name: `${args.societyName} Gym`,
    address: "",
    city: "",
    pincode: "",
    capacity: undefined,
    gymSqFt: "",
    rwaName: `${args.societyName} RWA`,
    totalUnits: undefined,
    contactPersonName: args.contactName,
    contactPersonEmail: args.contactEmail,
    contactPersonPhone: phone,
  }
}
