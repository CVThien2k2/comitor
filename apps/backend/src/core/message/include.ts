// Include mặc định khi query message (dùng chung cho message service và conversation service)
export const MESSAGE_INCLUDE = {
  createdByUser: { select: { id: true, name: true, avatarUrl: true } },
  accountCustomer: {
    select: {
      id: true,
      goldenProfileId: true,
      avatarUrl: true,
      name: true,
    },
  },
} as const

// Include mặc định khi query conversation (dùng chung cho conversation service và realtime events)
export const CONVERSATION_INCLUDE = {
  linkedAccount: { select: { id: true, provider: true, displayName: true } },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: MESSAGE_INCLUDE,
  },
}
