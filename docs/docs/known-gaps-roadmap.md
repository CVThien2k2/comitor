# Gaps Hiện Tại Và Roadmap

## Trạng thái hiện tại

Một số phần đã hoàn chỉnh ở backend nhưng frontend hoặc outbound flow vẫn đang dở dang/mocking.

## Gaps kỹ thuật chính

1. Message outbound chưa hoàn thiện end-to-end

- `MessageService.create(...)` hiện chưa hoàn tất luồng tạo và gửi message.
- Các sender provider (`zalo-oa`, `zalo-personal`) còn stub/chưa có logic gửi thực tế đầy đủ.

2. Một số màn hình frontend đang placeholder hoặc mock

- `customers`, `permissions`, `settings` đang là page rỗng.
- `users` page hiện đang dùng dữ liệu mock 500 records.

3. Realtime badges/init chưa đồng bộ đầy đủ

- `app.init` hiện trả `conversationsUnreadCount` mặc định `0`.
- Chưa có cơ chế tổng hợp badge theo dữ liệu thực tại thời điểm init.

4. Technical debt nhỏ

- Còn một số component/demo cũ trong frontend không còn theo flow chính.
- Cần chuẩn hóa thêm test coverage cho các integration flows.

## Đề xuất roadmap

## P1 - Hoàn thiện core messaging

- Hoàn thiện `MessageService.create` và outbound send flow.
- Bật đủ message sender cho từng provider.
- Đồng bộ trạng thái delivery qua socket events.

## P2 - Hoàn thiện màn hình quản trị

- Chuyển `users` từ mock sang API thật ở toàn bộ filter/sort/pagination.
- Triển khai đầy đủ `customers`, `permissions`, `settings`.

## P3 - Hardening vận hành

- Bổ sung metrics chi tiết cho queue throughput/error rate.
- Bổ sung alert rule cho health/readiness/log anomalies.
- Bổ sung integration tests cho OAuth/webhook/reconnect lifecycle.
