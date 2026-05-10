# Tổng quan nghiệp vụ và yêu cầu hệ thống

## 1) Bối cảnh nghiệp vụ

Doanh nghiệp đang chăm sóc khách hàng trên nhiều nền tảng khác nhau (Facebook, Zalo OA, Zalo cá nhân, và các kênh mở rộng). Dữ liệu hội thoại bị phân tán theo từng kênh, khó theo dõi trạng thái xử lý, khó phân công nhân sự, và khó đo lường hiệu suất vận hành.

## 2) Mục tiêu nghiệp vụ của Comitor

- **Hợp nhất khách hàng đa nền tảng về một nơi** để theo dõi tập trung.
- **Chuẩn hóa xử lý hội thoại** theo một quy trình thống nhất giữa các kênh.
- **Quản lý phân công công việc** cho agent/supervisor theo trạng thái và quyền hạn.
- **Đảm bảo phản hồi realtime** để tránh trễ xử lý và trùng thao tác.
- **Mở rộng được theo kênh mới** mà không phá vỡ luồng vận hành hiện tại.

## 3) Bài toán cốt lõi cần giải

### 3.1 Hợp nhất danh tính khách hàng
- Một khách hàng có thể tương tác từ nhiều kênh khác nhau.
- Hệ thống cần gom thông tin tài khoản/kênh liên kết về hồ sơ khách hàng thống nhất để tránh trùng lặp.

### 3.2 Hợp nhất luồng hội thoại
- Mọi tin nhắn inbound/outbound cần được đưa về một mô hình hội thoại chung.
- Hội thoại cần có trạng thái nghiệp vụ rõ ràng (đang chờ, đang xử lý, đã đóng, ...).

### 3.3 Điều phối và phân công xử lý
- Agent nhận xử lý hội thoại theo quyền và phạm vi được phân công.
- Supervisor/Admin quản lý phân bổ tải công việc, theo dõi hiệu quả xử lý.

### 3.4 Đồng bộ realtime đa người dùng
- Khi có thay đổi (tin nhắn mới, trạng thái xử lý, gán người phụ trách), tất cả người liên quan phải thấy ngay trên giao diện.

## 4) Vai trò người dùng chính

- **Admin**: cấu hình hệ thống, quản trị tài khoản liên kết kênh, phân quyền.
- **Supervisor**: giám sát hàng đợi hội thoại, phân công hoặc tái phân công.
- **Agent**: trực tiếp nhận và xử lý hội thoại khách hàng.

## 5) Phạm vi nghiệp vụ hiện tại

- Quản lý tài khoản liên kết theo từng kênh (bật/tắt, cập nhật thông tin kết nối).
- Quản lý hội thoại và tin nhắn tập trung.
- Hỗ trợ thao tác nhận xử lý hội thoại và đánh dấu đã đọc.
- Phát sự kiện realtime để đồng bộ trạng thái cho người dùng nội bộ.

## 6) Yêu cầu hệ thống xuất phát từ nghiệp vụ

- **Đa kênh**: tiếp nhận và chuẩn hóa dữ liệu từ nhiều provider.
- **An toàn phân quyền**: mọi thao tác nghiệp vụ phải đi qua kiểm tra quyền.
- **Khả năng mở rộng**: hỗ trợ scale realtime qua adapter/message broker phù hợp.
- **Tính nhất quán dữ liệu**: giảm trùng message/trùng hội thoại, đảm bảo thứ tự hiển thị.
- **Khả năng vận hành**: dễ giám sát, dễ khôi phục kết nối kênh, dễ truy vết sự cố.
