import type { Conversation, MessageItem } from "@/api/conversations"

// ─── Avatar Colors ──────────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ef4444", // Red
]

export function getAvatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

// ─── Channel Config ─────────────────────────────────────

export const channelConfig: Record<string, { color: string; bg: string }> = {
  zalo_oa: { color: "text-blue-500", bg: "bg-blue-50" },
  zalo_personal: { color: "text-blue-500", bg: "bg-blue-50" },
  facebook: { color: "text-blue-600", bg: "bg-blue-50" },
  gmail: { color: "text-red-500", bg: "bg-red-50" },
  phone: { color: "text-emerald-600", bg: "bg-emerald-50" },
}

// ─── Formatters ─────────────────────────────────────────

export function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

export function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "Vừa xong"
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return `${diffHours} giờ trước`
  }
  if (diffDays < 2) return "Hôm qua"
  if (diffDays <= 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

export function formatMessageDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000

  if (diff < oneDay && date.getDate() === now.getDate()) return "Hôm nay"
  if (diff < oneDay * 2) return "Hôm qua"
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatConversationLastViewedAt(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getConversationDisplayName(conv: Conversation) {
  if (conv.name) return conv.name
  const lastMsg = conv.messages?.[0]
  const customer = lastMsg?.accountCustomer
  if (customer?.name) return customer.name
  return "Khách hàng"
}

export function getProviderLabel(provider: string) {
  const map: Record<string, string> = {
    zalo_oa: "Zalo OA",
    zalo_personal: "Zalo",
    facebook: "Facebook",
    gmail: "Gmail",
    phone: "Phone",
  }
  return map[provider] || provider
}

export function getConversationTagLabel(tag: string) {
  const map: Record<string, string> = {
    business: "Doanh nghiệp",
  }
  return map[tag] || tag
}

export function getSenderName(msg: MessageItem) {
  if (msg.senderType === "customer") {
    return msg.accountCustomer?.name || "Khách hàng"
  }
  if (msg.senderType === "agent") {
    return msg.user?.name || "Agent"
  }
  return "Hệ thống"
}

/** Gộp tin từ cache Conversation với danh sách đã fetch; state local ưu tiên hơn để tránh bị dữ liệu fetch cũ ghi đè. */
export function mergeConversationSeedWithFetchedMessages(
  seed: MessageItem[],
  fetchedChronological: MessageItem[]
): MessageItem[] {
  const byId = new Map<string, MessageItem>()
  for (const m of fetchedChronological) byId.set(m.id, m)
  for (const m of seed) byId.set(m.id, m)
  return [...byId.values()].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    if (ta !== tb) return ta - tb
    return a.id.localeCompare(b.id)
  })
}
