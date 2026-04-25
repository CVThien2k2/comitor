import type { Conversation, MessageItem } from "@/api/conversations"
import { ChannelType, LinkAccountStatus } from "@workspace/database"

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

export const channelMeta: Record<ChannelType, { label: string; iconSrc: string; color: string; bg: string }> = {
  zalo_oa: {
    label: "Zalo OA",
    iconSrc: "/Zalo.png",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  zalo_personal: {
    label: "Zalo cá nhân",
    iconSrc: "/Zalo.png",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  facebook: {
    label: "Facebook",
    iconSrc: "/Facebook.png",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
}

export const linkAccountStatusMeta: Record<
  LinkAccountStatus,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  active: {
    label: "Đang hoạt động",
    badgeClassName: "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
    dotClassName: "bg-emerald-500",
  },
  inactive: {
    label: "Đã ngắt",
    badgeClassName: "border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
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
  if (provider in channelMeta) {
    return channelMeta[provider as ChannelType].label
  }
  return provider
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
