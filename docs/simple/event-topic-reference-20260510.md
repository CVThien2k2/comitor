# Event topic reference

## 1) Realtime events (WebSocket)

| Event | Mô tả |
|---|---|
| user-online | Người dùng online |
| user-offline | Người dùng offline |
| conversation-created | Có hội thoại mới được tạo/cập nhật |
| message-create | Có cập nhật message conversation realtime |
| message-created | Event message tạo mới (nếu dùng ở client) |
| message-delivery-succeeded | Gửi tin nhắn ra nền tảng thành công |
| message-delivery-failed | Gửi tin nhắn ra nền tảng thất bại |

## 2) Internal events (Backend)

| Event | Mô tả |
|---|---|
| message-outbound-created | Message outbound vừa được tạo, chờ xử lý gửi đi |
| user-online | User vừa online (nội bộ backend) |
| user-offline | User vừa offline (nội bộ backend) |

## 3) Ghi chú sử dụng

- Không phải client nào cũng cần subscribe toàn bộ event.
- Ưu tiên subscribe theo phạm vi công việc (room theo user/role).
- Khi nhận event, frontend merge theo định danh dữ liệu thay vì replace toàn bộ state.
