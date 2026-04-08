import { create } from "zustand"
import type { Conversation, MessageItem } from "@workspace/shared"
import {
  applyConversationReadOverride,
  getConversationLatestMessage,
  getCurrentConversationUnreadCount,
  getUnreadCountFromLatestMessage,
  patchConversationMessageReadState,
  type ConversationReadOverrideMap,
} from "@/lib/conversation-read-state"

const DEFAULT_CUSTOMER_DISPLAY_NAME = "Khách hàng"

/** Gộp theo id, sắp xếp tin mới nhất trước (`messages[0]` = mới nhất cho list). */
function mergeMessagesNewestFirst(existing: MessageItem[] | undefined, incoming: MessageItem[]): MessageItem[] {
  const byId = new Map<string, MessageItem>()
  for (const m of existing ?? []) byId.set(m.id, m)
  for (const m of incoming) byId.set(m.id, m)
  return [...byId.values()].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    if (ta !== tb) return tb - ta
    return b.id.localeCompare(a.id)
  })
}

function mergeMessagesNewestFirstPreferExisting(
  existing: MessageItem[] | undefined,
  incoming: MessageItem[] | undefined
): MessageItem[] {
  const byId = new Map<string, MessageItem>()
  for (const m of incoming ?? []) byId.set(m.id, m)
  for (const m of existing ?? []) byId.set(m.id, m)
  return [...byId.values()].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    if (ta !== tb) return tb - ta
    return b.id.localeCompare(a.id)
  })
}

function shouldSyncPersonalConversationName(currentName: string | null, previousFullName: string | null) {
  if (currentName === null || currentName === "" || currentName === DEFAULT_CUSTOMER_DISPLAY_NAME) return true
  if (!previousFullName) return false
  return currentName === previousFullName
}

function patchConversationCustomerName(
  conversation: Conversation,
  accountCustomerId: string,
  previousFullName: string | null,
  nextFullName: string | null
): Conversation {
  const messages = conversation.messages?.map((message) =>
    message.accountCustomerId === accountCustomerId && message.accountCustomer
      ? {
          ...message,
          accountCustomer: {
            ...message.accountCustomer,
            name: nextFullName,
          },
        }
      : message
  )

  const accountCustomer =
    conversation.accountCustomer?.id === accountCustomerId
      ? {
          ...conversation.accountCustomer,
          name: nextFullName,
        }
      : conversation.accountCustomer

  const conversationCustomers = conversation.conversationCustomers?.map((member) =>
    member.accountCustomer?.id === accountCustomerId
      ? {
          ...member,
          accountCustomer: {
            ...member.accountCustomer,
            name: nextFullName,
          },
        }
      : member
  )

  const name =
    conversation.type === "personal" &&
    conversation.accountCustomerId === accountCustomerId &&
    shouldSyncPersonalConversationName(conversation.name, previousFullName)
      ? nextFullName
      : conversation.name

  return {
    ...conversation,
    name,
    accountCustomer,
    conversationCustomers,
    messages,
  }
}

function mergeConversationData(current: Conversation, incoming: Conversation): Conversation {
  const hasMessages = !!current.messages?.length || !!incoming.messages?.length
  const messages = hasMessages
    ? mergeMessagesNewestFirstPreferExisting(current.messages, incoming.messages)
    : incoming.messages ?? current.messages
  const currentLastActivityAt = current.lastActivityAt ? new Date(current.lastActivityAt).getTime() : 0
  const incomingLastActivityAt = incoming.lastActivityAt ? new Date(incoming.lastActivityAt).getTime() : 0
  const lastActivityAt =
    incomingLastActivityAt >= currentLastActivityAt ? incoming.lastActivityAt : current.lastActivityAt
  const fallbackUnreadCount = Math.max(current.unreadCount ?? 0, incoming.unreadCount ?? 0)

  return {
    ...current,
    ...incoming,
    lastActivityAt,
    messages,
    unreadCount: getUnreadCountFromLatestMessage(messages, fallbackUnreadCount),
  }
}

type ManualUnreadSession = {
  conversationId: string
  messageId: string
}

type ChatState = {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  showUserInfoPanel: boolean
  pendingConversationReadOverrides: ConversationReadOverrideMap
  manualUnreadSession: ManualUnreadSession | null
}

type ChatActions = {
  setSelectedConversation: (conversation: Conversation | null) => void
  hydrateConversation: (conversation: Conversation) => void
  setConversations: (conversations: Conversation[]) => void
  /** Thêm các hội thoại mới (trang tiếp theo), bỏ qua id trùng */
  appendConversations: (incoming: Conversation[]) => void
  /**
   * Thêm/cập nhật tin (realtime, gửi tin, …). `messages` luôn mới nhất trước (`messages[0]` = preview list).
   */
  appendConversationMessages: (conversationId: string, incoming: MessageItem[]) => void
  /** Cập nhật `status` (vd. optimistic lỗi → `failed`). */
  updateConversationMessageStatus: (conversationId: string, messageId: string, status: MessageItem["status"]) => void
  /** Bỏ tin `messageId`, thêm/merge `message` (vd. optimistic → tin từ server). */
  replaceMessage: (conversationId: string, messageId: string, message: MessageItem) => void
  /**
   * Đánh dấu conversation đã đọc trên state hiện tại:
   * - `conversation.unreadCount = 0`
   * - `latest message.isRead = true` (nếu latest message đang có trong store)
   * @returns `{ wasUnread, hasUnreadInState }` để caller quyết định decrement/un-sync server
   */
  markAsRead: (conversationId: string) => { wasUnread: boolean; hasUnreadInState: boolean; latestMessageId: string | null }
  /**
   * Cập nhật trạng thái đã đọc của một message trong conversation trên state hiện tại:
   * - đồng bộ `conversation.unreadCount` theo trạng thái của latest message
   * - `messages[messageId].isRead = nextIsRead` nếu message đó đang có trong store
   * @returns unread count trước/sau để caller quyết định đồng bộ badge tổng
   */
  setMessageReadState: (
    conversationId: string,
    messageId: string,
    nextIsRead: boolean,
    fallbackPreviousIsRead: boolean
  ) => { previousUnreadCount: number; nextUnreadCount: number; didUpdate: boolean }
  beginManualUnreadSession: (conversationId: string, messageId: string) => void
  endManualUnreadSession: (conversationId?: string, messageId?: string) => void
  clearPendingConversationReadOverride: (conversationId: string, messageId?: string) => void
  syncAccountCustomerProfileName: (payload: {
    accountCustomerId: string
    previousFullName: string | null
    nextFullName: string | null
  }) => void
  setShowUserInfoPanel: (show: boolean) => void
  toggleUserInfoPanel: () => void
  reset: () => void
}

function dedupeById(items: Conversation[]): Conversation[] {
  const seen = new Set<string>()
  return items.filter((c) => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  conversations: [],
  selectedConversation: null,
  showUserInfoPanel: false,
  pendingConversationReadOverrides: {},
  manualUnreadSession: null,

  setSelectedConversation: (conversation) =>
    set((state) => ({
      selectedConversation: conversation
        ? applyConversationReadOverride(conversation, state.pendingConversationReadOverrides)
        : null,
    })),
  hydrateConversation: (conversation) =>
    set((state) => ({
      selectedConversation:
        state.selectedConversation?.id === conversation.id
          ? applyConversationReadOverride(
              mergeConversationData(state.selectedConversation, conversation),
              state.pendingConversationReadOverrides
            )
          : state.selectedConversation,
      conversations: state.conversations.map((item) =>
        item.id === conversation.id
          ? applyConversationReadOverride(
              mergeConversationData(item, conversation),
              state.pendingConversationReadOverrides
            )
          : item
      ),
    })),
  setShowUserInfoPanel: (show) => set({ showUserInfoPanel: show }),
  toggleUserInfoPanel: () => set((state) => ({ showUserInfoPanel: !state.showUserInfoPanel })),
  syncAccountCustomerProfileName: ({ accountCustomerId, previousFullName, nextFullName }) =>
    set((state) => ({
      selectedConversation: state.selectedConversation
        ? patchConversationCustomerName(state.selectedConversation, accountCustomerId, previousFullName, nextFullName)
        : state.selectedConversation,
      conversations: state.conversations.map((conversation) =>
        patchConversationCustomerName(conversation, accountCustomerId, previousFullName, nextFullName)
      ),
    })),

  setConversations: (conversations) =>
    set((state) => {
      const existingById = new Map(state.conversations.map((conversation) => [conversation.id, conversation]))
      return {
        conversations: dedupeById(conversations).map((conversation) => {
          const existing = existingById.get(conversation.id)
          return applyConversationReadOverride(
            existing ? mergeConversationData(existing, conversation) : conversation,
            state.pendingConversationReadOverrides
          )
        }),
      }
    }),

  appendConversations: (incoming) =>
    set((state) => {
      const existingById = new Map(state.conversations.map((conversation) => [conversation.id, conversation]))
      const seen = new Set(state.conversations.map((c) => c.id))
      const next = [...state.conversations]
      for (const c of incoming) {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          next.push(c)
          continue
        }

        const existing = existingById.get(c.id)
        if (!existing) continue
        const merged = applyConversationReadOverride(
          mergeConversationData(existing, c),
          state.pendingConversationReadOverrides
        )
        const index = next.findIndex((item) => item.id === c.id)
        if (index >= 0) next[index] = merged
      }
      const sortByLastActivityDesc = (a: Conversation, b: Conversation) => {
        const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        if (ta !== tb) return tb - ta
        return b.id.localeCompare(a.id)
      }

      return { conversations: next.slice().sort(sortByLastActivityDesc) }
    }),

  appendConversationMessages: (conversationId, incoming) =>
    set((state) => {
      if (incoming.length === 0) return {}

      const newestMessageCreatedAt = incoming.reduce((max, m) => {
        const t = m.createdAt ? new Date(m.createdAt).getTime() : new Date(m.timestamp).getTime()
        return t > max ? t : max
      }, 0)
      const newestLastActivityAt = new Date(newestMessageCreatedAt).toISOString()

      const patchConversation = (conversation: Conversation) => {
        const messages = mergeMessagesNewestFirst(conversation.messages, incoming)
        return applyConversationReadOverride(
          {
            ...conversation,
            messages,
            unreadCount: getUnreadCountFromLatestMessage(messages, conversation.unreadCount ?? 0),
            lastActivityAt: newestLastActivityAt,
          },
          state.pendingConversationReadOverrides
        )
      }

      const sortByLastActivityDesc = (a: Conversation, b: Conversation) => {
        const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        if (ta !== tb) return tb - ta
        return b.id.localeCompare(a.id)
      }
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patchConversation(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations
          .map((c) =>
            c.id === conversationId ? patchConversation(c) : c
          )
          .slice()
          .sort(sortByLastActivityDesc),
      }
    }),

  updateConversationMessageStatus: (conversationId, messageId, status) =>
    set((state) => {
      const now = new Date().toISOString()
      const patch = (c: Conversation) =>
        applyConversationReadOverride(
          {
            ...c,
            messages: (c.messages ?? []).map((m) => (m.id === messageId ? { ...m, status, updatedAt: now } : m)),
          },
          state.pendingConversationReadOverrides
        )
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    }),

  replaceMessage: (conversationId, messageId, message) =>
    set((state) => {
      const patch = (c: Conversation) => {
        const without = (c.messages ?? []).filter((m) => m.id !== messageId)
        return applyConversationReadOverride(
          { ...c, messages: mergeMessagesNewestFirst(without, [message]) },
          state.pendingConversationReadOverrides
        )
      }
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    }),

  markAsRead: (conversationId) => {
    const { conversations, selectedConversation } = get()
    const listConversation = conversations.find((c) => c.id === conversationId) ?? null
    const selected = selectedConversation?.id === conversationId ? selectedConversation : null

    const currentUnreadCount = getCurrentConversationUnreadCount(listConversation, selected)
    const wasUnread = currentUnreadCount > 0
    const latestMessage = getConversationLatestMessage(selected) ?? getConversationLatestMessage(listConversation)
    const hasUnreadInState = !!latestMessage && !latestMessage.isRead
    if (!wasUnread && !hasUnreadInState) {
      return { wasUnread: false, hasUnreadInState: false, latestMessageId: latestMessage?.id ?? null }
    }

    set((state) => {
      const patch = (c: Conversation): Conversation => {
        const latestMessageId = c.messages?.[0]?.id
        const messages =
          latestMessageId && c.messages
            ? c.messages.map((message) => (message.id === latestMessageId ? { ...message, isRead: true } : message))
            : c.messages

        return { ...c, unreadCount: 0, messages }
      }

      return {
        manualUnreadSession:
          state.manualUnreadSession?.conversationId === conversationId ? null : state.manualUnreadSession,
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    })

    return { wasUnread, hasUnreadInState, latestMessageId: latestMessage?.id ?? null }
  },

  setMessageReadState: (conversationId, messageId, nextIsRead, fallbackPreviousIsRead) => {
    const { conversations, selectedConversation } = get()
    const listConversation = conversations.find((c) => c.id === conversationId) ?? null
    const selected = selectedConversation?.id === conversationId ? selectedConversation : null

    const previousUnreadCount = getCurrentConversationUnreadCount(listConversation, selected)

    const selectedTarget = selected?.messages?.find((m) => m.id === messageId)
    const listTarget = selectedTarget ? undefined : listConversation?.messages?.find((m) => m.id === messageId)
    const currentTarget = selectedTarget ?? listTarget
    const previousIsRead = currentTarget ? currentTarget.isRead : fallbackPreviousIsRead

    if (previousIsRead === nextIsRead) {
      return { previousUnreadCount, nextUnreadCount: previousUnreadCount, didUpdate: false }
    }

    const nextListConversation = patchConversationMessageReadState(
      listConversation,
      messageId,
      nextIsRead,
      nextIsRead ? 0 : 1
    )
    const nextSelectedConversation = patchConversationMessageReadState(
      selected,
      messageId,
      nextIsRead,
      nextIsRead ? 0 : 1
    )
    const nextUnreadCount = getCurrentConversationUnreadCount(nextListConversation, nextSelectedConversation)

    set((state) => {
      const patch = (c: Conversation): Conversation => {
        const nextConversation = patchConversationMessageReadState(c, messageId, nextIsRead, nextUnreadCount)
        return nextConversation ? { ...nextConversation, unreadCount: nextUnreadCount } : c
      }

      const pendingConversationReadOverrides = {
        ...state.pendingConversationReadOverrides,
        [conversationId]: {
          messageId,
          isRead: nextIsRead,
        },
      }

      return {
        pendingConversationReadOverrides,
        manualUnreadSession:
          nextIsRead &&
          state.manualUnreadSession?.conversationId === conversationId &&
          state.manualUnreadSession.messageId === messageId
            ? null
            : state.manualUnreadSession,
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    })

    return { previousUnreadCount, nextUnreadCount, didUpdate: true }
  },

  beginManualUnreadSession: (conversationId, messageId) =>
    set({
      manualUnreadSession: {
        conversationId,
        messageId,
      },
    }),

  endManualUnreadSession: (conversationId, messageId) =>
    set((state) => {
      const currentSession = state.manualUnreadSession
      if (!currentSession) return {}
      if (conversationId && currentSession.conversationId !== conversationId) return {}
      if (messageId && currentSession.messageId !== messageId) return {}

      return { manualUnreadSession: null }
    }),

  clearPendingConversationReadOverride: (conversationId, messageId) =>
    set((state) => {
      const pendingOverride = state.pendingConversationReadOverrides[conversationId]
      if (!pendingOverride) return {}
      if (messageId && pendingOverride.messageId !== messageId) return {}

      const nextPendingConversationReadOverrides = { ...state.pendingConversationReadOverrides }
      delete nextPendingConversationReadOverrides[conversationId]

      return { pendingConversationReadOverrides: nextPendingConversationReadOverrides }
    }),

  reset: () =>
    set({
      conversations: [],
      selectedConversation: null,
      showUserInfoPanel: true,
      pendingConversationReadOverrides: {},
      manualUnreadSession: null,
    }),
}))
