# Trạng Thái Tính Năng (Theo Code)

> Snapshot theo mã nguồn hiện tại tại ngày **2026-05-05**.

## 1. Tính năng đã triển khai

### 1.1 Xác thực và phiên làm việc

- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `POST /init` trả `user`, `permissions`, `badges`.

### 1.2 Omni-channel và liên kết kênh

#### Zalo Personal

- `GET /platform/zalo/login` (QR login).
- `GET /platform/zalo/login/events/:sessionId` (SSE trạng thái).

#### Zalo OA

- `GET /platform/zalo-oa/connect` (redirect OAuth).
- `POST /platform/zalo-oa/callback` (tạo/cập nhật liên kết).

#### Facebook

- `GET /platform/meta/connect` (redirect OAuth).
- `POST /platform/meta/callback` (đồng bộ page vào link accounts).

#### Quản lý link account

- `GET /link-accounts`, `GET /link-accounts/stats`.
- `PATCH /link-accounts/:id`.
- `POST /link-accounts/:id/reconnect`, `POST /link-accounts/:id/disconnect`.
- `DELETE /link-accounts/:id`.

### 1.3 Hội thoại và tin nhắn

- Inbound pipeline: webhook/listener -> queue `incoming-message` -> normalize -> upsert conversation/message.
- `GET /conversations`, `GET /conversations/:id`, `PATCH /conversations/:id/assign`, `PATCH /conversations/:id/mark-read`.
- `GET /messages/conversation/:conversationId`, `GET /messages/:id`, `POST /messages`.
- Realtime Socket.IO dùng các event:
- `conversation-created`, `message-created`.
- `message-delivery-succeeded`, `message-delivery-failed`.

### 1.4 Quản trị nội bộ

- Users: `GET`, `POST`, `PATCH`, `DELETE` trên `/users`.
- Roles: `GET`, `GET/:id`, `POST`, `PATCH`, `DELETE` trên `/roles`.
- Permissions: `GET /permissions`, `PATCH /permissions/:id` (cập nhật mô tả).
- Suggested messages: `GET`, `POST`, `PATCH`, `DELETE` trên `/suggested-messages`.
- Agent levels: `GET`, `GET/:id`, `POST`, `PATCH`, `DELETE` trên `/agent-levels`.

### 1.5 Dữ liệu khách hàng

- Golden profiles: `GET`, `GET/:id`, `PATCH` trên `/golden-profiles`.
- Account customers: `GET /account-customers`.

### 1.6 Upload và vận hành

- Upload S3 presigned URL: `POST /upload/presign`, `POST /upload/presign-batch`.
- Xóa file: `POST /upload/delete`, `POST /upload/delete-batch`.
- Health endpoints: `GET /live`, `GET /ready`, `GET /health`.

## 2. Giới hạn hiện tại (đã xác nhận trong code)

- Outbound message hiện chỉ hỗ trợ **text** cho `zalo_oa`, `zalo_personal`, `facebook`.
- `/settings` frontend hiện là trang rỗng.
- `account-customers` hiện mới có luồng xem danh sách (chưa có CRUD riêng).
- `permissions` chỉ cho cập nhật mô tả, không có luồng CRUD đầy đủ.
- Badge `conversationsUnreadCount` trong `/init` hiện đếm theo tổng cuộc hội thoại unread toàn hệ thống.
