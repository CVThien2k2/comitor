# Đồng bộ và realtime

## 1) Mục tiêu

- Đảm bảo trạng thái hội thoại/tin nhắn được cập nhật gần thời gian thực trên Web.
- Hạn chế mất đồng bộ khi có nhiều nguồn dữ liệu cùng đẩy vào.

## 2) Luồng đồng bộ chính

1. Dữ liệu vào từ Webhook/Socket.
2. Đẩy vào Queue để xử lý tập trung.
3. Backend ghi DB và phát event realtime.
4. Web nhận event, cập nhật store và UI.

## 3) Event realtime đang dùng

- `user-online`
- `user-offline`
- `conversation-created`
- `message-create`
- `message-created`
- `message-delivery-succeeded`
- `message-delivery-failed`

## 4) Nguyên tắc đồng bộ phía Web

- Merge dữ liệu theo `conversationId` và `messageId`.
- Sắp xếp message theo timestamp + id để ổn định thứ tự.
- Hỗ trợ trạng thái tạm (`processing`) và cập nhật sau khi có kết quả gửi.

## 5) Rủi ro và cách giảm thiểu

- Event đến trễ hoặc lặp: dùng dedupe theo ID.
- Mất kết nối tạm thời: khi reconnect cần đồng bộ lại dữ liệu mới nhất từ API.
- Nhiều tab/client cùng mở: ưu tiên state theo dữ liệu server khi có xung đột.
