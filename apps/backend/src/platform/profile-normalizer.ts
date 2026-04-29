const MIN_YEAR = 1900
const MAX_YEAR = 2100

const toIsoDate = (year: number, month: number, day: number): string | undefined => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined
  if (year < MIN_YEAR || year > MAX_YEAR) return undefined
  if (month < 1 || month > 12) return undefined
  if (day < 1 || day > 31) return undefined

  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined
  }

  return date.toISOString().slice(0, 10)
}

export const normalizeDateOfBirth = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === "") return undefined

  if (typeof value === "number" && Number.isFinite(value)) {
    const timestamp = value > 9999999999 ? value : value * 1000
    const date = new Date(timestamp)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
  }

  if (typeof value !== "string") return undefined
  const raw = value.trim()
  if (!raw) return undefined

  if (/^\d+$/.test(raw)) {
    if (raw.length === 8) {
      const firstYear = Number(raw.slice(0, 4))
      if (firstYear >= MIN_YEAR && firstYear <= MAX_YEAR) {
        return toIsoDate(firstYear, Number(raw.slice(4, 6)), Number(raw.slice(6, 8)))
      }
      return toIsoDate(Number(raw.slice(4, 8)), Number(raw.slice(2, 4)), Number(raw.slice(0, 2)))
    }

    const timestampNumber = Number(raw)
    if (Number.isFinite(timestampNumber) && raw.length >= 10) {
      const timestamp = raw.length > 10 ? timestampNumber : timestampNumber * 1000
      const date = new Date(timestamp)
      return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
    }
  }

  const parts = raw.split(/[\/\-.]/).map((part) => part.trim())
  if (parts.length === 3 && parts.every((part) => /^\d+$/.test(part))) {
    const [a, b, c] = parts.map(Number)
    if (parts[0].length === 4) return toIsoDate(a, b, c)
    if (parts[2].length === 4) return toIsoDate(c, b, a) ?? toIsoDate(c, a, b)
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10)
}

export const normalizePrimaryPhone = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return undefined
    return String(Math.trunc(value))
  }

  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  if (!trimmed || trimmed === "0") return undefined
  return trimmed
}
