# Luồng Tính Năng

## 1. Authentication & Session

### Login

1. Frontend gọi `POST /auth/login` với `username/password`.
2. Backend kiểm tra user và mật khẩu (`bcrypt`).
3. Backend trả `accessToken`, set refresh token, kèm thông tin user và permission list.

### Refresh token

1. FE interceptor tự gọi `POST /auth/refresh` khi access token hết hạn.
2. Backend xác minh refresh token, cấp access token mới.
3. FE retry request ban đầu.

### Forgot/reset password

- `POST /auth/forgot-password`: tạo token reset và gửi mail qua Resend.
- `POST /auth/reset-password`: đổi mật khẩu và revoke refresh token cũ.

## 2. Khởi tạo ứng dụng (`/init`)

1. Sau login, FE gọi `POST /init`.
2. Backend trả về `user`, `permissions`, `badges`.
3. FE nạp dữ liệu vào store để render navigation theo quyền.

## 3. Liên kết kênh

### Zalo Personal (QR + SSE)

1. FE gọi `GET /platform/zalo/login`.
2. Backend tạo session đăng nhập, trả `sessionId` + `qrCode`.
3. FE mở `EventSource` đến `GET /platform/zalo/login/events/:sessionId`.
4. Backend emit các trạng thái `qr_ready | scanned | success | expired | declined | error`.
5. Khi `success`, backend tạo/cập nhật `link_account` và khởi tạo instance listener.

### Zalo OA (OAuth)

1. FE mở `GET /platform/zalo-oa/connect` để redirect qua Zalo OAuth.
2. Zalo redirect về FE kèm `code`.
3. FE gọi `POST /platform/zalo-oa/callback`.
4. Backend đổi token, lấy profile OA, tạo/cập nhật link account.

### Facebook (OAuth)

1. FE mở `GET /platform/meta/connect`.
2. Facebook redirect về FE kèm `code/state`.
3. FE gọi `POST /platform/meta/callback`.
4. Backend đổi user token, lấy page token + page info, lưu nhiều page vào link accounts.

### Reconnect/Disconnect

- Reconnect: `POST /link-accounts/:id/reconnect`, backend validate provider trước khi chuyển `status=active`.
- Disconnect: `POST /link-accounts/:id/disconnect`, chuyển `status=inactive`.

## 4. Inbound message pipeline

1. Webhook/Listener nhận payload nền tảng.
2. Helper map payload về `MessagePlatform`.
3. Đẩy vào BullMQ queue `incoming-message`.
4. Worker xử lý:
- dedupe theo `externalMessageId`
- kiểm tra link account active
- tạo/tìm account customer
- upsert conversation
- create message
5. Phát socket event `conversation-created` hoặc `message-created`.

## 5. Conversation workspace

- FE lấy danh sách hội thoại qua `GET /conversations` (cursor theo `lastActivityAt` + `id`).
- FE lấy message theo cuộc hội thoại qua `GET /messages/conversation/:conversationId`.
- FE subscribe socket để chèn dữ liệu realtime vào local store.

## 6. Upload media

- FE gọi `POST /upload/presign` hoặc `POST /upload/presign-batch`.
- Backend cấp pre-signed URL S3.
- FE upload trực tiếp lên S3, sau đó dùng URL khi gửi message.
