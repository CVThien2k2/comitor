# System config và bảo mật dữ liệu

## 1) Nguyên tắc chung

- Cấu hình hệ thống qua biến môi trường.
- Không hard-code secret trong mã nguồn.
- Tách rõ cấu hình theo môi trường (dev/staging/prod).

## 2) Bảo mật truy cập

- API nội bộ đi qua JWT.
- Quyền thao tác kiểm soát theo role/permission.
- Các route public chỉ mở cho webhook/callback thực sự cần thiết.

## 3) Bảo mật dữ liệu

- Thông tin nhạy cảm (token, credentials, secret key) không ghi log thô.
- Credentials nền tảng lưu có kiểm soát, không trả ra API công khai.
- Dữ liệu khách hàng áp dụng nguyên tắc tối thiểu cần dùng.

## 4) Cấu hình kết nối hạ tầng

- Database, Redis, S3, Email đều cấu hình qua env.
- Khi deploy production cần thay toàn bộ giá trị mặc định trong `.env.example`.
- Các dịch vụ ngoài phải có health-check/monitoring cơ bản.

## 5) CORS và kết nối realtime

- CORS phải giới hạn theo domain frontend thực tế.
- Socket cần cơ chế xác thực token trước khi cho join room.
- Các event realtime nên phát theo phạm vi phù hợp (user/role/all).
