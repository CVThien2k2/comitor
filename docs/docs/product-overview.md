# Tổng Quan Sản Phẩm

## Bài toán

Comitor giải quyết nhu cầu vận hành hội thoại khách hàng trên nhiều kênh trong một hệ thống thống nhất:

- Đội CSKH không phải mở từng nền tảng riêng lẻ.
- Trạng thái xử lý hội thoại được đồng bộ theo thời gian thực.
- Dữ liệu khách hàng được gom về mô hình thống nhất để phục vụ chăm sóc và phân tích.

## Nhóm người dùng chính

- Admin/System: quản lý cấu hình hệ thống, role/permission, tài khoản nội bộ.
- Supervisor/Lead: giám sát tiến độ xử lý hội thoại, phân bổ nguồn lực.
- Agent: xử lý hội thoại, cập nhật trạng thái và thông tin khách hàng.

## Miền chức năng chính

1. Omni-channel ingestion

- Nhận dữ liệu hội thoại từ Zalo OA webhook, Meta webhook, Zalo personal socket listener.
- Chuẩn hóa payload đa nền tảng về contract nội bộ (`MessagePlatform`).

2. Link account management

- Kết nối và quản lý các tài khoản kênh.
- Hỗ trợ reconnect/disconnect và kiểm tra tính hợp lệ trước khi tái kích hoạt.

3. Conversation & message workspace

- Danh sách hội thoại phân trang/cursor.
- Realtime cập nhật hội thoại/tin nhắn mới.
- Luồng read/unread và đánh dấu đã đọc.

4. Internal user governance

- Quản lý user/role/permission.
- RBAC theo permission code chi tiết.

5. Platform integration services

- OAuth cho Zalo OA/Facebook.
- QR login + SSE cho Zalo personal.
- Upload media qua AWS S3 pre-signed URL.

## Danh sách tính năng theo phạm vi hiện tại

### Hội thoại

- Danh sách hội thoại, chi tiết hội thoại, nhận xử lý, đánh dấu đã đọc.
- Đồng bộ realtime trạng thái/tin nhắn qua Socket.IO.

### Kênh kết nối

- Kết nối Zalo Personal (QR + SSE), Zalo OA (OAuth), Facebook (OAuth).
- Quản lý link account: tìm kiếm/lọc, thống kê, reconnect, disconnect, xóa.

### Quản trị

- Users, Roles, Agent Levels, Suggested Messages đã có CRUD.
- Permissions hỗ trợ danh sách + cập nhật mô tả.

### Khách hàng

- Golden Profiles có danh sách/chi tiết/cập nhật.
- Account Customers hiện hỗ trợ danh sách.

### Hệ thống

- Auth đầy đủ (login/refresh/logout/forgot/reset).
- Upload qua presigned URL.
- Health checks: live/ready/health.

Chi tiết theo endpoint và trạng thái có tại trang [Trạng thái tính năng](feature-status.md).

## Giá trị kỹ thuật

- Monorepo giúp chia sẻ type và contract xuyên suốt FE/BE/DB.
- Queue + realtime event tách biệt xử lý nặng và trải nghiệm UI.
- Thiết kế module hoá theo domain (`core/*`, `platform/*`) giúp mở rộng kênh mới dễ hơn.
