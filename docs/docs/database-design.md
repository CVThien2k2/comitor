# Thiết Kế Database

## Công nghệ

- PostgreSQL
- Prisma schema tập trung tại `packages/database/prisma/schema/*`
- Generated Prisma client dùng chung cho backend + type sharing

## Nhóm bảng chính

1. Identity & Access

- `user`
- `roles`
- `permissions`
- `role_permissions`
- `refresh_tokens`

2. Omni-channel mapping

- `link_accounts`
- `account_customer`
- `golden_profiles`
- `conversation_customers`

3. Conversation workspace

- `conversations`
- `messages`
- `conversation_processing_sessions`
- `conversation_session_assignees`

4. Supporting domain

- `agent_levels`
- `suggested_messages`

## ERD mức nghiệp vụ

```mermaid
erDiagram
  USER ||--o{ LINK_ACCOUNT : creates
  USER ||--o{ ROLE : creates
  USER ||--o{ PERMISSION : creates
  ROLE ||--o{ ROLE_PERMISSION : has
  PERMISSION ||--o{ ROLE_PERMISSION : assigned
  ROLE ||--o{ USER : grants

  LINK_ACCOUNT ||--o{ CONVERSATION : owns
  LINK_ACCOUNT ||--o{ ACCOUNT_CUSTOMER : maps
  LINK_ACCOUNT ||--o{ GOLDEN_PROFILE : scopes

  GOLDEN_PROFILE ||--o{ ACCOUNT_CUSTOMER : aggregates
  ACCOUNT_CUSTOMER ||--o{ CONVERSATION_CUSTOMER : joins
  CONVERSATION ||--o{ CONVERSATION_CUSTOMER : joins

  CONVERSATION ||--o{ MESSAGE : contains
  ACCOUNT_CUSTOMER ||--o{ MESSAGE : sends
  USER ||--o{ MESSAGE : creates

  CONVERSATION ||--o{ PROCESSING_SESSION : tracks
  PROCESSING_SESSION ||--o{ SESSION_ASSIGNEE : assigns
  USER ||--o{ SESSION_ASSIGNEE : works
```

## Unique/index quan trọng

- `link_accounts`: unique `(accountId, provider)`.
- `conversations`: unique `(linkedAccountId, externalId)`.
- `account_customer`: unique `(accountId, linkedAccountId)`.
- `role_permissions`: unique `(roleId, permissionId)`.
- `messages`: index `(conversationId, timestamp desc, id desc)` để phân trang message.

## Chuẩn dữ liệu

- Enum nghiệp vụ: `ChannelType`, `MessageType`, `ConversationType`, `LinkAccountStatus`, ...
- Soft-delete flag `isDeleted` xuất hiện ở nhiều bảng domain.
- Các trường thời gian chuẩn hóa `createdAt`, `updatedAt`.

## Seed mặc định

Seed script khởi tạo:

- user `systemadmin`
- role `system`
- toàn bộ permission từ constants
- gán full permission cho role system
