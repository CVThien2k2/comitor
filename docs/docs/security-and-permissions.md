# Bảo Mật Và Phân Quyền

## Authentication

- JWT access token dùng cho API và socket auth.
- Refresh token cấp lại access token khi hết hạn.
- FE interceptor tự xử lý refresh và retry request.

## Authorization

- Toàn bộ endpoint private theo mặc định.
- Route public phải khai báo `@Public()` rõ ràng.
- Route yêu cầu quyền cụ thể dùng `@Permissions(P.XXX)`.

## Permission model

Permission code theo mẫu:

- wildcard toàn hệ thống: `*`
- wildcard theo nhóm: `<group>:*`
- CRUD chi tiết: `<group>:create|read|update|delete`

Nhóm chính hiện có: `user`, `role`, `permission`, `conversation`, `message`, `customer`, `golden-profile`, `account-customer`, `link-account`, `agent-level`, `upload`, ...

## Session & password security

- Mật khẩu hash với `bcrypt`.
- Reset password token phát sinh ngẫu nhiên, lưu dạng hash trong Redis TTL.
- Sau reset password: revoke toàn bộ refresh token của user.

## Data access hardening

- Dùng unique constraints để chống tạo trùng trong race condition.
- Queue worker dedupe message theo `externalMessageId`.
- Status `inactive` được dùng để chặn account provider không còn hợp lệ.

## Transport & origin

- CORS backend cấu hình theo `FRONTEND_URL`.
- API cookies bật `withCredentials`.

## Logging & audit

- Request/response có log interceptor.
- Health endpoint phục vụ monitor readiness/liveness.
- Log container được gom về Loki qua Promtail.
