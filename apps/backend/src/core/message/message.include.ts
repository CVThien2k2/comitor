// Include mặc định khi query message (dùng chung cho message service và conversation service)
export const MESSAGE_INCLUDE = {
  attachments: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
  accountCustomer: {
    select: {
      id: true,
      goldenProfileId: true,
      avatarUrl: true,
      name: true,
    },
  },
} as const
