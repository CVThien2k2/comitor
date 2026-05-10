# Quy chuẩn request/response/message

## 1) Quy chuẩn request

- API request dùng DTO rõ ràng.
- Validate dữ liệu đầu vào ngay tại biên API.
- Không nhận field thừa ngoài schema cho phép.

## 2) Quy chuẩn response

- Response format thống nhất toàn hệ thống.
- API lỗi trả cấu trúc nhất quán để frontend xử lý đồng bộ.
- Trả mã trạng thái phản ánh đúng bản chất lỗi (auth, validation, not found, conflict, system).

## 3) Quy chuẩn message nghiệp vụ

### 3.1 Message trong Database
- Mỗi message gắn `conversationId`.
- Message outbound có vòng đời trạng thái: `processing`, `success`, `failed`.
- Message inbound/outbound đều chuẩn hóa về cùng cấu trúc nghiệp vụ.

### 3.2 Message realtime
- Event phải có định danh đủ để frontend merge/dedupe (`conversationId`, `messageId` nếu có).
- Payload ngắn gọn, đủ dữ liệu để cập nhật UI mà không cần fetch lại toàn bộ ngay lập tức.

## 4) Quy chuẩn idempotency và thứ tự

- Deduplicate theo định danh message từ nền tảng (`externalId`) ở tầng xử lý.
- Sắp xếp message theo `timestamp` và tie-breaker theo `id` để ổn định.
- Khi có xung đột giữa local state và server event, ưu tiên dữ liệu server.
