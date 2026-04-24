// prettier-ignore
export const PERMISSION = {
  // Global
  FULL_ACCESS: { code: "*", description: "Full access to everything" },

  // User
  USER_FULL: { code: "user:*", description: "Full access to user management" },
  USER_CREATE: { code: "user:create", description: "Create new users" },
  USER_READ: { code: "user:read", description: "View user details" },
  USER_UPDATE: { code: "user:update", description: "Update user information" },
  USER_DELETE: { code: "user:delete", description: "Delete users" },

  // Role
  ROLE_FULL: { code: "role:*", description: "Full access to role management" },
  ROLE_CREATE: { code: "role:create", description: "Create new roles" },
  ROLE_READ: { code: "role:read", description: "View role details" },
  ROLE_UPDATE: { code: "role:update", description: "Update role information" },
  ROLE_DELETE: { code: "role:delete", description: "Delete roles" },

  // Permission
  PERMISSION_FULL: { code: "permission:*", description: "Full access to permission management" },
  PERMISSION_CREATE: { code: "permission:create", description: "Create new permissions" },
  PERMISSION_READ: { code: "permission:read", description: "View permission details" },
  PERMISSION_UPDATE: { code: "permission:update", description: "Update permission information" },
  PERMISSION_DELETE: { code: "permission:delete", description: "Delete permissions" },

  // Role Permission
  ROLE_PERMISSION_FULL: { code: "role-permission:*", description: "Full access to role-permission management" },
  ROLE_PERMISSION_CREATE: { code: "role-permission:create", description: "Assign permissions to roles" },
  ROLE_PERMISSION_READ: { code: "role-permission:read", description: "View role-permission mappings" },
  ROLE_PERMISSION_UPDATE: { code: "role-permission:update", description: "Update role-permission mappings" },
  ROLE_PERMISSION_DELETE: { code: "role-permission:delete", description: "Remove permissions from roles" },

  // Conversation
  CONVERSATION_FULL: { code: "conversation:*", description: "Full access to conversation management" },
  CONVERSATION_CREATE: { code: "conversation:create", description: "Create new conversations" },
  CONVERSATION_READ: { code: "conversation:read", description: "View conversations" },
  CONVERSATION_UPDATE: { code: "conversation:update", description: "Update conversation details" },
  CONVERSATION_DELETE: { code: "conversation:delete", description: "Delete conversations" },

 
  // Processing Session
  PROCESSING_SESSION_FULL: { code: "processing-session:*", description: "Full access to processing-session management" },
  PROCESSING_SESSION_CREATE: { code: "processing-session:create", description: "Create processing sessions" },
  PROCESSING_SESSION_READ: { code: "processing-session:read", description: "View processing sessions" },
  PROCESSING_SESSION_UPDATE: { code: "processing-session:update", description: "Update processing sessions" },
  PROCESSING_SESSION_DELETE: { code: "processing-session:delete", description: "Delete processing sessions" },

  // Session Assignee
  SESSION_ASSIGNEE_FULL: { code: "session-assignee:*", description: "Full access to session-assignee management" },
  SESSION_ASSIGNEE_CREATE: { code: "session-assignee:create", description: "Assign users to processing sessions" },
  SESSION_ASSIGNEE_READ: { code: "session-assignee:read", description: "View session assignees" },
  SESSION_ASSIGNEE_UPDATE: { code: "session-assignee:update", description: "Update session assignees" },
  SESSION_ASSIGNEE_DELETE: { code: "session-assignee:delete", description: "Remove users from processing sessions" },

  // Message
  MESSAGE_FULL: { code: "message:*", description: "Full access to message management" },
  MESSAGE_CREATE: { code: "message:create", description: "Send messages" },
  MESSAGE_READ: { code: "message:read", description: "View messages" },
  MESSAGE_UPDATE: { code: "message:update", description: "Edit messages" },
  MESSAGE_DELETE: { code: "message:delete", description: "Delete messages" },

  // Suggested Message
  SUGGESTED_MESSAGE_FULL: { code: "suggested-message:*", description: "Full access to suggested-message management" },
  SUGGESTED_MESSAGE_CREATE: { code: "suggested-message:create", description: "Create suggested messages" },
  SUGGESTED_MESSAGE_READ: { code: "suggested-message:read", description: "View suggested messages" },
  SUGGESTED_MESSAGE_UPDATE: { code: "suggested-message:update", description: "Update suggested messages" },
  SUGGESTED_MESSAGE_DELETE: { code: "suggested-message:delete", description: "Delete suggested messages" },

  // Customer
  CUSTOMER_FULL: { code: "customer:*", description: "Full access to customer management" },
  CUSTOMER_CREATE: { code: "customer:create", description: "Create new customers" },
  CUSTOMER_READ: { code: "customer:read", description: "View customer details" },
  CUSTOMER_UPDATE: { code: "customer:update", description: "Update customer information" },
  CUSTOMER_DELETE: { code: "customer:delete", description: "Delete customers" },

  // Golden Profile
  GOLDEN_PROFILE_FULL: { code: "golden-profile:*", description: "Toàn quyền quản lý hồ sơ khách hàng" },
  GOLDEN_PROFILE_READ: { code: "golden-profile:read", description: "Xem hồ sơ khách hàng" },
  GOLDEN_PROFILE_UPDATE: { code: "golden-profile:update", description: "Cập nhật hồ sơ khách hàng" },
  GOLDEN_PROFILE_DELETE: { code: "golden-profile:delete", description: "Xóa hồ sơ khách hàng" },

  // Account Customer
  ACCOUNT_CUSTOMER_FULL: { code: "account-customer:*", description: "Toàn quyền quản lý tài khoản khách" },
  ACCOUNT_CUSTOMER_READ: { code: "account-customer:read", description: "Xem tài khoản khách" },
  ACCOUNT_CUSTOMER_UPDATE: { code: "account-customer:update", description: "Cập nhật tài khoản khách" },
  ACCOUNT_CUSTOMER_DELETE: { code: "account-customer:delete", description: "Xóa tài khoản khách" },

  // Link Account
  LINK_ACCOUNT_FULL: { code: "link-account:*", description: "Toàn quyền quản lý liên kết kênh" },
  LINK_ACCOUNT_READ: { code: "link-account:read", description: "Xem liên kết kênh" },
  LINK_ACCOUNT_UPDATE: { code: "link-account:update", description: "Cập nhật liên kết kênh" },
  LINK_ACCOUNT_DELETE: { code: "link-account:delete", description: "Xóa liên kết kênh" },

  // Agent Level
  AGENT_LEVEL_FULL: { code: "agent-level:*", description: "Full access to agent-level management" },
  AGENT_LEVEL_CREATE: { code: "agent-level:create", description: "Create agent levels" },
  AGENT_LEVEL_READ: { code: "agent-level:read", description: "View agent levels" },
  AGENT_LEVEL_UPDATE: { code: "agent-level:update", description: "Update agent levels" },
  AGENT_LEVEL_DELETE: { code: "agent-level:delete", description: "Delete agent levels" },


  // Upload
  UPLOAD_FULL: { code: "upload:*", description: "Full access to file management" },
  UPLOAD_CREATE: { code: "upload:create", description: "Upload files" },
  UPLOAD_READ: { code: "upload:read", description: "View uploaded files" },
  UPLOAD_DELETE: { code: "upload:delete", description: "Delete uploaded files" },
} as const

export type PermissionKey = keyof typeof PERMISSION
export type PermissionCode = (typeof PERMISSION)[PermissionKey]["code"]

export const P = Object.fromEntries(Object.entries(PERMISSION).map(([key, val]) => [key, val.code])) as {
  [K in PermissionKey]: (typeof PERMISSION)[K]["code"]
}
