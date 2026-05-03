# Thiết Kế Frontend

## Nền tảng kỹ thuật

- Next.js 16 (App Router)
- React 19
- TypeScript
- React Query 5
- Zustand 5
- Socket.IO client
- UI components từ `@workspace/ui`

## Cấu trúc route

- `app/(auth)`: login, forgot-password, reset-password.
- `app/(user)`: khu vực vận hành đã đăng nhập.
- Layout user gồm sidebar + header + content và hỗ trợ responsive mobile.

## App state

### Auth store (`zustand`)

- Lưu `accessToken` (persist), `user`, `permissions`, `isAuthenticated`.
- `axios` interceptor tự gắn token vào request.
- Khi 401, FE tự gọi refresh token; thất bại thì logout.

### Chat store

- Giữ danh sách hội thoại đang hiển thị.
- Hỗ trợ append realtime, sort theo `lastActivityAt`, mark-as-read local.

## Data fetching

- Tất cả API gọi qua `api/*` và `lib/axios.ts`.
- React Query quản lý cache/invalidation cho danh sách link account, app init, users, conversations.
- Một số màn hình đang ở trạng thái mock/placeholder (xem phần roadmap).

## Navigation & permission

- Khai báo nav tập trung tại `lib/app-navigation.ts`.
- Menu được filter theo permission code (bao gồm wildcard `*`, `${group}:*`, `${group}:view|read`).
- Breadcrumb lấy trail từ route tree đã resolve.

## Realtime

- Kết nối Socket.IO namespace `/websocket` khi có token.
- Event chính:
- `conversation-created`
- `message-created`
- `message-delivery-succeeded`
- `message-delivery-failed`
- Handler cập nhật store tại chỗ để UI phản hồi tức thời.

## Luồng links page

- Liệt kê link account dạng grid, filter/search, infinite query.
- Add connection dialog cho `zalo_oa`, `zalo_personal`, `facebook`.
- Callback OAuth được FE xử lý qua query params rồi gọi API callback tương ứng.
