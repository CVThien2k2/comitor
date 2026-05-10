# Trace và idempotency

## 1) Mục tiêu

- Theo dõi được luồng xử lý từ lúc nhận dữ liệu đến lúc cập nhật giao diện.
- Giảm tối đa xử lý trùng khi nền tảng ngoài gửi lặp hoặc retry.

## 2) Trace trong dự án hiện tại

### 2.1 Điểm vào
- Zalo OA/Meta vào qua Webhook.
- Zalo vào qua Socket rồi đẩy vào Queue.

### 2.2 Điểm xử lý trung tâm
- Queue worker xử lý chuẩn hóa dữ liệu và ghi vào conversation/message.
- Backend phát realtime để Web cập nhật trạng thái.

### 2.3 Gợi ý trace thống nhất
- Mỗi request/event nên có `traceId`.
- Log tại các chặng chính: `ingress -> queue -> backend -> database -> realtime`.
- Khi emit realtime, nên giữ lại `traceId` trong payload nội bộ để tiện truy vết.

## 3) Idempotency trong dự án hiện tại

- Queue đang tạo `jobId` từ provider + externalMessageId để giảm duplicate job.
- Worker kiểm tra message theo `externalId`; nếu đã có thì bỏ qua.
- Conversation được upsert theo khóa duy nhất `(linkedAccountId, externalId)` để tránh nhân bản hội thoại.

## 4) Rủi ro trùng phổ biến

- Nền tảng gửi lại webhook do timeout mạng.
- Worker retry khi lỗi tạm thời.
- Người dùng thao tác gửi lại nhiều lần trong thời gian ngắn.

## 5) Nguyên tắc áp dụng

- Ưu tiên dedupe tại tầng queue/worker trước khi ghi DB.
- Chỉ coi xử lý thành công khi transaction dữ liệu hoàn tất.
- Realtime event cần đi kèm định danh message/conversation để client tự dedupe.
