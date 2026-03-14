export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function parseDays(value: string): number {
  const match = value.match(/^(\d+)d$/i)
  return match ? parseInt(match[1] ?? "0", 10) : 0
}

export function parseDaysToMs(value: string): number {
  return parseDays(value) * 24 * 60 * 60 * 1000
}

export function parseDurationToMs(value: string): number {
  const match = value.match(/^(\d+)(s|m|h|d)$/)
  if (!match) return 0
  const num = parseInt(match[1] ?? "0", 10)
  const unit = match[2]
  if (unit === "s") return num * 1000
  if (unit === "m") return num * 60 * 1000
  if (unit === "h") return num * 60 * 60 * 1000
  return num * 24 * 60 * 60 * 1000
}
