// prettier-ignore
export const PERMISSION = {
  // Global
  FULL_ACCESS: { code: "*", group: "*", description: "Full access to everything" },

  // User
  USER_FULL: { code: "user:*", group: "user", description: "Full access to user management" },
  USER_CREATE: { code: "user:create", group: "user", description: "Create new users" },
  USER_READ: { code: "user:read", group: "user", description: "View user details" },
  USER_UPDATE: { code: "user:update", group: "user", description: "Update user information" },
  USER_DELETE: { code: "user:delete", group: "user", description: "Delete users" },

  // Role
  ROLE_FULL: { code: "role:*", group: "role", description: "Full access to role management" },
  ROLE_CREATE: { code: "role:create", group: "role", description: "Create new roles" },
  ROLE_READ: { code: "role:read", group: "role", description: "View role details" },
  ROLE_UPDATE: { code: "role:update", group: "role", description: "Update role information" },
  ROLE_DELETE: { code: "role:delete", group: "role", description: "Delete roles" },

  // Permission
  PERMISSION_FULL: { code: "permission:*", group: "permission", description: "Full access to permission management" },
  PERMISSION_CREATE: { code: "permission:create", group: "permission", description: "Create new permissions" },
  PERMISSION_READ: { code: "permission:read", group: "permission", description: "View permission details" },
  PERMISSION_UPDATE: { code: "permission:update", group: "permission", description: "Update permission information" },
  PERMISSION_DELETE: { code: "permission:delete", group: "permission", description: "Delete permissions" },

  // Role Permission
  ROLE_PERMISSION_FULL: { code: "role-permission:*", group: "role-permission", description: "Full access to role-permission management" },
  ROLE_PERMISSION_CREATE: { code: "role-permission:create", group: "role-permission", description: "Assign permissions to roles" },
  ROLE_PERMISSION_READ: { code: "role-permission:read", group: "role-permission", description: "View role-permission mappings" },
  ROLE_PERMISSION_UPDATE: { code: "role-permission:update", group: "role-permission", description: "Update role-permission mappings" },
  ROLE_PERMISSION_DELETE: { code: "role-permission:delete", group: "role-permission", description: "Remove permissions from roles" },

  // Conversation
  CONVERSATION_FULL: { code: "conversation:*", group: "conversation", description: "Full access to conversation management" },
  CONVERSATION_CREATE: { code: "conversation:create", group: "conversation", description: "Create new conversations" },
  CONVERSATION_READ: { code: "conversation:read", group: "conversation", description: "View conversations" },
  CONVERSATION_UPDATE: { code: "conversation:update", group: "conversation", description: "Update conversation details" },
  CONVERSATION_DELETE: { code: "conversation:delete", group: "conversation", description: "Delete conversations" },

 
  // Processing Session
  PROCESSING_SESSION_FULL: { code: "processing-session:*", group: "processing-session", description: "Full access to processing-session management" },
  PROCESSING_SESSION_CREATE: { code: "processing-session:create", group: "processing-session", description: "Create processing sessions" },
  PROCESSING_SESSION_READ: { code: "processing-session:read", group: "processing-session", description: "View processing sessions" },
  PROCESSING_SESSION_UPDATE: { code: "processing-session:update", group: "processing-session", description: "Update processing sessions" },
  PROCESSING_SESSION_DELETE: { code: "processing-session:delete", group: "processing-session", description: "Delete processing sessions" },

  // Session Assignee
  SESSION_ASSIGNEE_FULL: { code: "session-assignee:*", group: "session-assignee", description: "Full access to session-assignee management" },
  SESSION_ASSIGNEE_CREATE: { code: "session-assignee:create", group: "session-assignee", description: "Assign users to processing sessions" },
  SESSION_ASSIGNEE_READ: { code: "session-assignee:read", group: "session-assignee", description: "View session assignees" },
  SESSION_ASSIGNEE_UPDATE: { code: "session-assignee:update", group: "session-assignee", description: "Update session assignees" },
  SESSION_ASSIGNEE_DELETE: { code: "session-assignee:delete", group: "session-assignee", description: "Remove users from processing sessions" },

  // Message
  MESSAGE_FULL: { code: "message:*", group: "message", description: "Full access to message management" },
  MESSAGE_CREATE: { code: "message:create", group: "message", description: "Send messages" },
  MESSAGE_READ: { code: "message:read", group: "message", description: "View messages" },
  MESSAGE_UPDATE: { code: "message:update", group: "message", description: "Edit messages" },
  MESSAGE_DELETE: { code: "message:delete", group: "message", description: "Delete messages" },

  // Suggested Message
  SUGGESTED_MESSAGE_FULL: { code: "suggested-message:*", group: "suggested-message", description: "Full access to suggested-message management" },
  SUGGESTED_MESSAGE_CREATE: { code: "suggested-message:create", group: "suggested-message", description: "Create suggested messages" },
  SUGGESTED_MESSAGE_READ: { code: "suggested-message:read", group: "suggested-message", description: "View suggested messages" },
  SUGGESTED_MESSAGE_UPDATE: { code: "suggested-message:update", group: "suggested-message", description: "Update suggested messages" },
  SUGGESTED_MESSAGE_DELETE: { code: "suggested-message:delete", group: "suggested-message", description: "Delete suggested messages" },

  // Customer
  CUSTOMER_FULL: { code: "customer:*", group: "customer", description: "Full access to customer management" },
  CUSTOMER_CREATE: { code: "customer:create", group: "customer", description: "Create new customers" },
  CUSTOMER_READ: { code: "customer:read", group: "customer", description: "View customer details" },
  CUSTOMER_UPDATE: { code: "customer:update", group: "customer", description: "Update customer information" },
  CUSTOMER_DELETE: { code: "customer:delete", group: "customer", description: "Delete customers" },

  // Golden Profile
  GOLDEN_PROFILE_FULL: { code: "golden-profile:*", group: "golden-profile", description: "Toàn quyền quản lý hồ sơ khách hàng" },
  GOLDEN_PROFILE_READ: { code: "golden-profile:read", group: "golden-profile", description: "Xem hồ sơ khách hàng" },
  GOLDEN_PROFILE_UPDATE: { code: "golden-profile:update", group: "golden-profile", description: "Cập nhật hồ sơ khách hàng" },
  GOLDEN_PROFILE_DELETE: { code: "golden-profile:delete", group: "golden-profile", description: "Xóa hồ sơ khách hàng" },

  // Account Customer
  ACCOUNT_CUSTOMER_FULL: { code: "account-customer:*", group: "account-customer", description: "Toàn quyền quản lý tài khoản khách" },
  ACCOUNT_CUSTOMER_READ: { code: "account-customer:read", group: "account-customer", description: "Xem tài khoản khách" },
  ACCOUNT_CUSTOMER_UPDATE: { code: "account-customer:update", group: "account-customer", description: "Cập nhật tài khoản khách" },
  ACCOUNT_CUSTOMER_DELETE: { code: "account-customer:delete", group: "account-customer", description: "Xóa tài khoản khách" },

  // Link Account
  LINK_ACCOUNT_FULL: { code: "link-account:*", group: "link-account", description: "Toàn quyền quản lý liên kết kênh" },
  LINK_ACCOUNT_READ: { code: "link-account:read", group: "link-account", description: "Xem liên kết kênh" },
  LINK_ACCOUNT_UPDATE: { code: "link-account:update", group: "link-account", description: "Cập nhật liên kết kênh" },
  LINK_ACCOUNT_DELETE: { code: "link-account:delete", group: "link-account", description: "Xóa liên kết kênh" },

  // Agent Level
  AGENT_LEVEL_FULL: { code: "agent-level:*", group: "agent-level", description: "Full access to agent-level management" },
  AGENT_LEVEL_CREATE: { code: "agent-level:create", group: "agent-level", description: "Create agent levels" },
  AGENT_LEVEL_READ: { code: "agent-level:read", group: "agent-level", description: "View agent levels" },
  AGENT_LEVEL_UPDATE: { code: "agent-level:update", group: "agent-level", description: "Update agent levels" },
  AGENT_LEVEL_DELETE: { code: "agent-level:delete", group: "agent-level", description: "Delete agent levels" },


  // Upload
  UPLOAD_FULL: { code: "upload:*", group: "upload", description: "Full access to file management" },
  UPLOAD_CREATE: { code: "upload:create", group: "upload", description: "Upload files" },
  UPLOAD_READ: { code: "upload:read", group: "upload", description: "View uploaded files" },
  UPLOAD_DELETE: { code: "upload:delete", group: "upload", description: "Delete uploaded files" },
} as const

export type PermissionKey = keyof typeof PERMISSION
export type PermissionCode = (typeof PERMISSION)[PermissionKey]["code"]
export type GroupKey = (typeof PERMISSION)[PermissionKey]["group"]

export const P = Object.fromEntries(Object.entries(PERMISSION).map(([key, val]) => [key, val.code])) as {
  [K in PermissionKey]: (typeof PERMISSION)[K]["code"]
}
