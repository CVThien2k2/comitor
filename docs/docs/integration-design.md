# Thiết Kế Tích Hợp Nền Tảng

## Zalo Personal

## Use case

- Liên kết tài khoản cá nhân qua QR.
- Nhận tin nhắn cá nhân/nhóm từ listener SDK.

## Cơ chế

1. Backend tạo QR login session bằng `zca-js`.
2. FE theo dõi trạng thái qua SSE.
3. Sau success, backend lưu `credentials` (cookie/imei/userAgent/profile).
4. Zalo instance được giữ trong registry để phục vụ listener và reconnect.

## Trạng thái SSE

- `qr_ready`
- `scanned`
- `success`
- `expired`
- `declined`
- `error`

## Zalo OA

## Use case

- Kết nối OA doanh nghiệp qua OAuth.
- Nhận webhook inbound/outbound từ OA.

## Cơ chế

1. Redirect người dùng tới OAuth permission URL.
2. Đổi `code` sang access/refresh token.
3. Lấy profile OA, lưu link account.
4. Khi reconnect, tự refresh token nếu gần hết hạn hoặc đã hết hạn.

## Facebook Meta

## Use case

- Kết nối user có quyền quản lý page.
- Đồng bộ page account vào hệ thống.
- Nhận webhook message từ Meta.

## Cơ chế

1. OAuth lấy short-lived user token.
2. Exchange sang long-lived token.
3. Lấy danh sách page + page info.
4. Lưu từng page thành link account có `pageAccessToken`.

## Webhook mapping layer

- `mapZaloOaWebhook(payload)` -> `MessagePlatform | null`.
- `mapMetasWebhook(payload)` -> `MessagePlatform[] | null`.
- `mapMessage(zaloPersonalEvent, linkedAccountId)` -> `MessagePlatform | null`.

Mục tiêu của layer này là thống nhất contract inbound trước khi đưa vào queue.

## AWS S3

- Backend cấp pre-signed PUT URL.
- Frontend upload trực tiếp để giảm tải backend.
- Backend cung cấp API delete đơn lẻ và theo lô.
