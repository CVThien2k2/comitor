# Gaps Hiện Tại Và Roadmap

## Trạng thái hiện tại

Core flow đã chạy xuyên suốt cho auth, link account, inbound message pipeline, conversation workspace, realtime socket, và đa số màn hình quản trị.

## Gaps kỹ thuật chính

1. Outbound message chưa hỗ trợ đa định dạng

- Luồng outbound đã chạy end-to-end, nhưng sender hiện chỉ hỗ trợ `text`.
- Chưa có logic gửi đầy đủ cho `image/file/video/audio/template` theo từng provider.

2. Màn hình settings chưa triển khai

- `app/(user)/settings/page.tsx` hiện trả về layout rỗng.

3. Scope badge `init` còn thô

- `/init` đã trả `conversationsUnreadCount` từ DB thật.
- Giá trị hiện đếm tổng cuộc hội thoại unread, chưa tách theo user/team scope.

4. Phạm vi module khách hàng còn lệch giữa các màn hình

- `golden-profiles` đã có list/detail/update.
- `account-customers` hiện mới ở mức xem danh sách, chưa có các thao tác quản trị mở rộng.

## Đề xuất roadmap

## P1 - Hoàn thiện outbound messaging theo provider

- Mở rộng sender để hỗ trợ media và template theo từng kênh.
- Chuẩn hóa payload gửi theo loại message và phản hồi delivery detail rõ hơn.
- Đồng bộ rule validate nội dung gửi giữa FE/BE.

## P2 - Hoàn thiện settings và scope vận hành

- Triển khai module `settings` (cấu hình hệ thống, tích hợp, thông số vận hành).
- Bổ sung badge theo scope user/team tại `/init`.

## P3 - Mở rộng quản trị khách hàng

- Bổ sung capability quản trị sâu cho `account-customers` (search/filter/update lifecycle).
- Đồng bộ chặt hơn giữa `account-customer` và `golden-profile`.

## P4 - Hardening vận hành

- Bổ sung metrics chi tiết cho queue throughput/error rate.
- Bổ sung alert rule cho health/readiness/log anomalies.
- Bổ sung integration tests cho OAuth/webhook/reconnect lifecycle.
