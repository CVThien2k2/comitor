# Test strategy và cases

## 1) Mục tiêu kiểm thử

- Đảm bảo đúng nghiệp vụ hội thoại đa nền tảng.
- Đảm bảo luồng realtime và trạng thái tin nhắn ổn định.
- Giảm rủi ro regression khi thay đổi backend/web.

## 2) Phạm vi test theo tầng

### 2.1 Unit test
- Service nghiệp vụ chính: auth, conversation, message, link-account, permission.
- Hàm map dữ liệu webhook/socket.
- Các utility quan trọng (paginate, sort, merge).

### 2.2 Integration test
- API + DB cho các luồng chính: đăng nhập, danh sách hội thoại, gửi tin nhắn.
- Queue worker + DB với inbound message.
- Websocket handshake và phát event chính.

### 2.3 UI/flow test (nếu có)
- Mở hội thoại, gửi tin, nhận trạng thái success/failed.
- Đánh dấu đã đọc, cập nhật unread count.
- Reconnect websocket và đồng bộ lại dữ liệu.

## 3) Bộ test case ưu tiên

1. Inbound message tạo mới conversation đúng.
2. Inbound message trùng `externalId` không tạo bản ghi mới.
3. Outbound message cập nhật đúng vòng đời `processing -> success/failed`.
4. Phân quyền không cho user thiếu quyền thao tác.
5. Link account inactive không cho gửi tin.
6. Query phân trang hội thoại/tin nhắn trả thứ tự đúng.

## 4) Quy tắc chạy test

- Chạy test theo module thay đổi trước.
- Không bắt buộc full-repo test nếu không đổi diện rộng.
- Khi sửa luồng lõi (queue/message/conversation), bắt buộc thêm hoặc cập nhật test case tương ứng.
