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

  // Conversation
  CONVERSATION_FULL: { code: "conversation:*", description: "Full access to conversation management" },
  CONVERSATION_CREATE: { code: "conversation:create", description: "Create new conversations" },
  CONVERSATION_READ: { code: "conversation:read", description: "View conversations" },
  CONVERSATION_UPDATE: { code: "conversation:update", description: "Update conversation details" },
  CONVERSATION_DELETE: { code: "conversation:delete", description: "Delete conversations" },

  // Message
  MESSAGE_FULL: { code: "message:*", description: "Full access to message management" },
  MESSAGE_CREATE: { code: "message:create", description: "Send messages" },
  MESSAGE_READ: { code: "message:read", description: "View messages" },
  MESSAGE_UPDATE: { code: "message:update", description: "Edit messages" },
  MESSAGE_DELETE: { code: "message:delete", description: "Delete messages" },

  // Customer
  CUSTOMER_FULL: { code: "customer:*", description: "Full access to customer management" },
  CUSTOMER_CREATE: { code: "customer:create", description: "Create new customers" },
  CUSTOMER_READ: { code: "customer:read", description: "View customer details" },
  CUSTOMER_UPDATE: { code: "customer:update", description: "Update customer information" },
  CUSTOMER_DELETE: { code: "customer:delete", description: "Delete customers" },

  // Upload
  UPLOAD_FULL: { code: "upload:*", description: "Full access to file management" },
  UPLOAD_CREATE: { code: "upload:create", description: "Upload files" },
  UPLOAD_READ: { code: "upload:read", description: "View uploaded files" },
  UPLOAD_DELETE: { code: "upload:delete", description: "Delete uploaded files" },
} as const

export type PermissionKey = keyof typeof PERMISSION
export type PermissionCode = (typeof PERMISSION)[PermissionKey]["code"]

export const P = Object.fromEntries(
  Object.entries(PERMISSION).map(([key, val]) => [key, val.code])
) as { [K in PermissionKey]: (typeof PERMISSION)[K]["code"] }
