import { CustomerType, Gender, GoldenProfile } from "@workspace/database"
import { MetaProfileResponse } from "src/utils/types"
import { ZaloOaProfileResponse } from "src/utils/types"

export function mapGender(value: unknown): Gender | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === "number") {
    if (value === 1) return Gender.male
    if (value === 2) return Gender.female
    return Gender.other
  }

  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (["1", "male", "nam"].includes(normalized)) {
    return Gender.male
  }

  if (["2", "female", "nu", "nữ"].includes(normalized)) {
    return Gender.female
  }

  if (normalized) {
    return Gender.other
  }

  return null
}

export function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replace(/\//g, "-")
  const directDate = new Date(normalized)

  if (!Number.isNaN(directDate.getTime())) {
    return directDate
  }

  const parts = normalized.split("-")
  if (parts.length === 3) {
    const [first, second, third] = parts.map((part) => Number(part))
    if ([first, second, third].every((part) => Number.isFinite(part))) {
      const inferredDate =
        String(parts[0]).length === 4 ? new Date(first, second - 1, third) : new Date(third, second - 1, first)

      return Number.isNaN(inferredDate.getTime()) ? null : inferredDate
    }
  }

  return null
}

export function readString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function getDefaultGoldenProfileValues(): Pick<GoldenProfile, "loyaltyPoints" | "customerType" | "isBlacklisted"> {
  return {
    loyaltyPoints: 0,
    customerType: CustomerType.individual,
    isBlacklisted: false,
  }
}

export function mapProfileToGoldenProfile(response: ZaloOaProfileResponse, userId: string): Partial<GoldenProfile> {
  const profile = response.data ?? {}

  const id = readString(profile.id) ?? readString(profile.user_id) ?? userId

  const fullName = readString(profile.display_name) ?? readString(profile.name)

  const gender = mapGender(profile.user_gender ?? profile.gender ?? profile.sex)

  const dateOfBirth = parseDate(profile.birth_date ?? profile.birthday ?? profile.date_of_birth)

  const primaryPhone = readString(profile.phone) ?? readString(profile.user_phone) ?? readString(profile.phone_number)

  const primaryEmail = readString(profile.email)

  const address = readString(profile.address)

  const city = readString(profile.city) ?? readString(profile.location)

  return {
    ...(id && { id }),
    ...(fullName && { fullName }),
    ...(gender && { gender }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(primaryPhone && { primaryPhone }),
    ...(primaryEmail && { primaryEmail }),
    ...(address && { address }),
    ...(city && { city }),
    ...getDefaultGoldenProfileValues(),
  }
}

export function mapMetaProfileToGoldenProfile(response: MetaProfileResponse, userId: string): Partial<GoldenProfile> {
  const id = readString(response.id) ?? userId
  const fallbackFullName =
    [readString(response.first_name), readString(response.last_name)]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim() || null

  const fullName = readString(response.name) ?? fallbackFullName

  const gender = mapGender(response.gender)

  return {
    ...(id && { id }),
    ...(fullName && { fullName }),
    ...(gender && { gender }),
    ...getDefaultGoldenProfileValues(),
  }
}
