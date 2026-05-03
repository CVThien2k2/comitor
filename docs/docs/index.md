# Comitor Documentation

Comitor là nền tảng omni-channel cho đội ngũ vận hành chăm sóc khách hàng, tập trung vào:

- Gom hội thoại từ nhiều kênh (`zalo_oa`, `zalo_personal`, `facebook`) về một giao diện.
- Quản lý vòng đời liên kết tài khoản kênh (connect, reconnect, disconnect).
- Quản trị người dùng nội bộ, role và permission.
- Xử lý realtime hội thoại/tin nhắn qua Socket.IO và xử lý bất đồng bộ qua queue.

## Tài liệu này bao gồm

- Mô tả chi tiết tính năng và luồng nghiệp vụ.
- Kiến trúc hệ thống frontend/backend/database.
- Tích hợp nền tảng ngoài (Zalo, Meta, S3).
- Bảo mật, phân quyền, và triển khai vận hành.
- Danh sách phần đã hoàn thiện và các hạng mục đang tạm mock/chưa xong.

## Thành phần chính trong monorepo

- `apps/backend`: NestJS API, webhook/SSE/socket, queue xử lý message.
- `apps/web`: Next.js App Router cho giao diện vận hành.
- `packages/database`: Prisma schema + generated client + seed + permission constants.
- `packages/ui`: UI component dùng chung cho frontend.

## Link nhanh

- [Tổng quan sản phẩm](product-overview.md)
- [Luồng tính năng](feature-flows.md)
- [Kiến trúc hệ thống](architecture-overview.md)
- [Thiết kế database](database-design.md)
- [Triển khai và vận hành](deployment-and-ops.md)
