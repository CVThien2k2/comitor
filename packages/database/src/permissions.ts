// prettier-ignore
export const PERMISSION = {
  // Toàn cục
  FULL_ACCESS: { code: "*", group: "*", description: "Toàn quyền truy cập tất cả" },

  // Người dùng
  USER_FULL: { code: "user:*", group: "user", description: "Toàn quyền quản lý người dùng" },
  USER_CREATE: { code: "user:create", group: "user", description: "Tạo người dùng mới" },
  USER_READ: { code: "user:read", group: "user", description: "Xem chi tiết người dùng" },
  USER_UPDATE: { code: "user:update", group: "user", description: "Cập nhật thông tin người dùng" },
  USER_DELETE: { code: "user:delete", group: "user", description: "Xóa người dùng" },

  // Vai trò
  ROLE_FULL: { code: "role:*", group: "role", description: "Toàn quyền quản lý vai trò" },
  ROLE_CREATE: { code: "role:create", group: "role", description: "Tạo vai trò mới" },
  ROLE_READ: { code: "role:read", group: "role", description: "Xem chi tiết vai trò" },
  ROLE_UPDATE: { code: "role:update", group: "role", description: "Cập nhật thông tin vai trò" },
  ROLE_DELETE: { code: "role:delete", group: "role", description: "Xóa vai trò" },

  // Quyền
  PERMISSION_FULL: { code: "permission:*", group: "permission", description: "Toàn quyền quản lý quyền" },
  PERMISSION_READ: { code: "permission:read", group: "permission", description: "Xem chi tiết quyền" },
  PERMISSION_UPDATE: { code: "permission:update", group: "permission", description: "Cập nhật thông tin quyền" },

  // Hội thoại
  CONVERSATION_FULL: { code: "conversation:*", group: "conversation", description: "Toàn quyền quản lý hội thoại" },
  CONVERSATION_READ: { code: "conversation:read", group: "conversation", description: "Xem hội thoại" },
  CONVERSATION_UPDATE: { code: "conversation:update", group: "conversation", description: "Cập nhật chi tiết hội thoại" },

  // Tin nhắn
  MESSAGE_FULL: { code: "message:*", group: "message", description: "Toàn quyền quản lý tin nhắn" },
  MESSAGE_CREATE: { code: "message:create", group: "message", description: "Gửi tin nhắn" },
  MESSAGE_READ: { code: "message:read", group: "message", description: "Xem tin nhắn" },
  MESSAGE_UPDATE: { code: "message:update", group: "message", description: "Chỉnh sửa tin nhắn" },
  MESSAGE_DELETE: { code: "message:delete", group: "message", description: "Xóa tin nhắn" },

  // Tin nhắn gợi ý
  SUGGESTED_MESSAGE_FULL: { code: "suggested-message:*", group: "suggested-message", description: "Toàn quyền quản lý tin nhắn gợi ý" },
  SUGGESTED_MESSAGE_CREATE: { code: "suggested-message:create", group: "suggested-message", description: "Tạo tin nhắn gợi ý" },
  SUGGESTED_MESSAGE_READ: { code: "suggested-message:read", group: "suggested-message", description: "Xem tin nhắn gợi ý" },
  SUGGESTED_MESSAGE_UPDATE: { code: "suggested-message:update", group: "suggested-message", description: "Cập nhật tin nhắn gợi ý" },
  SUGGESTED_MESSAGE_DELETE: { code: "suggested-message:delete", group: "suggested-message", description: "Xóa tin nhắn gợi ý" },

  // Hồ sơ khách hàng
  GOLDEN_PROFILE_FULL: { code: "golden-profile:*", group: "golden-profile", description: "Toàn quyền quản lý hồ sơ khách hàng" },
  GOLDEN_PROFILE_READ: { code: "golden-profile:read", group: "golden-profile", description: "Xem hồ sơ khách hàng" },
  GOLDEN_PROFILE_UPDATE: { code: "golden-profile:update", group: "golden-profile", description: "Cập nhật hồ sơ khách hàng" },

  // Tài khoản khách
  ACCOUNT_CUSTOMER_FULL: { code: "account-customer:*", group: "account-customer", description: "Toàn quyền quản lý tài khoản khách" },
  ACCOUNT_CUSTOMER_READ: { code: "account-customer:read", group: "account-customer", description: "Xem tài khoản khách" },
  ACCOUNT_CUSTOMER_UPDATE: { code: "account-customer:update", group: "account-customer", description: "Cập nhật tài khoản khách" },
  ACCOUNT_CUSTOMER_DELETE: { code: "account-customer:delete", group: "account-customer", description: "Xóa tài khoản khách" },

  // Liên kết kênh
  LINK_ACCOUNT_FULL: { code: "link-account:*", group: "link-account", description: "Toàn quyền quản lý liên kết kênh" },
  LINK_ACCOUNT_READ: { code: "link-account:read", group: "link-account", description: "Xem liên kết kênh" },
  LINK_ACCOUNT_UPDATE: { code: "link-account:update", group: "link-account", description: "Cập nhật liên kết kênh" },
  LINK_ACCOUNT_DELETE: { code: "link-account:delete", group: "link-account", description: "Xóa liên kết kênh" },
  LINK_ACCOUNT_CREATE: { code: "link-account:create", group: "link-account", description: "Tạo liên kết kênh" },

  // Cấp độ nhân viên
  AGENT_LEVEL_FULL: { code: "agent-level:*", group: "agent-level", description: "Toàn quyền quản lý cấp độ nhân viên" },
  AGENT_LEVEL_CREATE: { code: "agent-level:create", group: "agent-level", description: "Tạo cấp độ nhân viên" },
  AGENT_LEVEL_READ: { code: "agent-level:read", group: "agent-level", description: "Xem cấp độ nhân viên" },
  AGENT_LEVEL_UPDATE: { code: "agent-level:update", group: "agent-level", description: "Cập nhật cấp độ nhân viên" },
  AGENT_LEVEL_DELETE: { code: "agent-level:delete", group: "agent-level", description: "Xóa cấp độ nhân viên" },
} as const

export type PermissionKey = keyof typeof PERMISSION
export type PermissionCode = (typeof PERMISSION)[PermissionKey]["code"]
export type GroupKey = (typeof PERMISSION)[PermissionKey]["group"]

export const P = Object.fromEntries(Object.entries(PERMISSION).map(([key, val]) => [key, val.code])) as {
  [K in PermissionKey]: (typeof PERMISSION)[K]["code"]
}
