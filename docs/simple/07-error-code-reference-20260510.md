# Error code reference

## 1) Nhóm xác thực và phân quyền

| Code | Ý nghĩa | Hướng xử lý |
|---|---|---|
| AUTH_UNAUTHORIZED | Chưa đăng nhập / token hết hạn | Đăng nhập lại, refresh phiên |
| FORBIDDEN | Không đủ quyền thao tác | Kiểm tra role/permission |

## 2) Nhóm dữ liệu đầu vào

| Code | Ý nghĩa | Hướng xử lý |
|---|---|---|
| VALIDATION_ERROR | Payload không đúng DTO/ràng buộc | Sửa dữ liệu request |
| NOT_FOUND | Không tìm thấy bản ghi liên quan | Kiểm tra id và trạng thái dữ liệu |
| CONFLICT | Dữ liệu trùng khóa unique | Kiểm tra dữ liệu đã tồn tại trước khi tạo |

## 3) Nhóm xử lý nghiệp vụ

| Code | Ý nghĩa | Hướng xử lý |
|---|---|---|
| MESSAGE_SEND_FAILED | Gửi tin nhắn ra nền tảng thất bại | Retry theo policy, kiểm tra account linked |
| LINK_ACCOUNT_INACTIVE | Tài khoản liên kết không hoạt động | Bật lại kết nối/tạo lại phiên |
| CONVERSATION_INVALID_STATE | Hội thoại không ở trạng thái cho phép thao tác | Chuyển trạng thái đúng trước khi xử lý |

## 4) Nhóm hệ thống

| Code | Ý nghĩa | Hướng xử lý |
|---|---|---|
| INTERNAL_ERROR | Lỗi nội bộ chưa phân loại | Kiểm tra log + traceId |
| REDIS_UNAVAILABLE | Không kết nối được Redis | Kiểm tra dịch vụ Redis |
| DATABASE_ERROR | Lỗi truy vấn DB/transaction | Kiểm tra schema, query, lock |
| STORAGE_ERROR | Lỗi upload/read từ S3 | Kiểm tra quyền bucket và thông số kết nối |
