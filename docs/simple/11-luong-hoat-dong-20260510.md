# Luồng hoạt động

## 1) Luồng inbound từ nền tảng

1. Nền tảng gửi dữ liệu vào Webhook hoặc Socket.
2. Hệ thống đẩy dữ liệu vào Queue.
3. Worker xử lý, chuẩn hóa và ghi conversation/message vào Database.
4. Backend phát event realtime cho Web.
5. Web cập nhật UI theo dữ liệu mới.

## 2) Luồng outbound từ Web

1. Agent thao tác gửi tin từ Web.
2. Backend tạo message trạng thái `processing`.
3. Backend gửi tin ra nền tảng tương ứng.
4. Cập nhật trạng thái message `success` hoặc `failed`.
5. Realtime event trả về Web để phản ánh kết quả gửi.

## 3) Luồng xử lý hội thoại

1. Danh sách hội thoại tải theo `lastActivityAt`.
2. Agent mở hội thoại, tải lịch sử message theo phân trang.
3. Khi có message mới, unread count và trạng thái hội thoại được cập nhật.
4. Khi agent xử lý xong, trạng thái hội thoại được cập nhật theo nghiệp vụ.

## 4) Luồng xác thực và phân quyền

1. Người dùng đăng nhập nhận access token.
2. API request đi qua lớp xác thực.
3. Thao tác nghiệp vụ đi qua kiểm tra permission.
4. Kết nối realtime xác thực token trước khi join room.
