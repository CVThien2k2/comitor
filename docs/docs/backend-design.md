# Thiết Kế Backend

## Nền tảng kỹ thuật

- Framework: NestJS 11
- Runtime: Node.js >= 20
- ORM: Prisma Client (PostgreSQL adapter)
- Queue: BullMQ
- Realtime: Socket.IO
- Docs: Swagger tại `/docs`

## Request lifecycle

`HTTP Request -> Global Guards -> Interceptors -> ValidationPipe -> Controller -> Service -> Prisma -> Response`

### Guard mặc định toàn cục

- `JwtAuthGuard`: xác thực JWT cho toàn bộ route (trừ route có `@Public()`).
- `PermissionsGuard`: kiểm tra quyền dựa trên decorator `@Permissions(...)`.

### Interceptor/Filter

- `LoggerInterceptor`: log request/response.
- `ResponseInterceptor`: bọc response chuẩn hệ thống.
- `HttpExceptionFilter`: chuẩn hóa lỗi HTTP.

## Module domain chính

- `AuthModule`: login/refresh/logout/forgot/reset password.
- `UsersModule`, `RoleModule`, `PermissionModule`.
- `LinkAccountModule`: quản lý kết nối kênh, reconnect/disconnect.
- `ConversationModule`, `MessageModule`: nghiệp vụ hội thoại và tin nhắn.
- `GoldenProfileModule`, `AccountCustomerModule`, `SuggestedMessageModule`.
- `PlatformModule`: OAuth/webhook/listener/provider adapters.
- `UploadModule`: S3 pre-signed URL.

## Queue processing

### Queue config

- Queue name: `incoming-message`
- Redis DB: `1`
- Retry: 2 lần, backoff exponential.

### Worker `MessageProcessor`

- Nhận `MessagePlatform` đã normalize.
- Dedupe theo `externalMessageId`.
- Kiểm tra link account active.
- Upsert conversation theo unique `(linkedAccountId, externalId)`.
- Tạo message và mapping account customer.
- Phát socket event tương ứng.

## Webhook & SDK integration

- `POST /webhook/zalo-oa`: nhận webhook Zalo OA.
- `GET/POST /webhook/meta`: verify và nhận webhook Meta.
- Zalo personal dùng `zca-js`, đăng nhập QR và lắng nghe sự kiện nội bộ.

## Health endpoints

- `GET /live`: liveness.
- `GET /ready`: readiness cho DB/Redis.
- `GET /health`: tổng hợp trạng thái nhanh.

## API docs

Swagger được bật mặc định:

- `/docs`
- `/docs/json`
- `/docs/yaml`
