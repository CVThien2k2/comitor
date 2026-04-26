# Hướng dẫn tổ chức Code Backend (NestJS)

Tài liệu này quy định chi tiết cách tổ chức code, chuẩn viết API và quản lý flow cho ứng dụng Backend của hệ thống Comitor.

---

## 1. Request Lifecycle (Luồng đi của một Request)

Khi một request đi vào Backend, nó sẽ đi qua các tầng sau:
`Request` -> `Middleware` (Cors, Helmet) -> `Guards` (JwtAuthGuard, PermissionsGuard) -> `Interceptors` (Logging, Transform) -> `Pipes` (Validation DTO) -> **`Controller`** -> **`Service`** -> **`Database (Prisma)`** -> `Response`.

---

## 2. Xác thực (Authentication) & Phân quyền (Authorization)

Mặc định, hệ thống được cấu hình bảo vệ toàn bộ các route (Global Guard là `JwtAuthGuard` & `PermissionsGuard`).

- **Public Route (Không cần đăng nhập)**:
  Thêm decorator `@Public()` lấy từ `src/common/decorators/public.decorator.ts`.

  ```typescript
  import { Public } from '../../common/decorators/public.decorator';

  @Public()
  @Get('login')
  login() { ... }
  ```

- **Private Route (Cần đăng nhập)**: Mặc định đã là private.
- **Phân quyền Route (Cần có quyền cụ thể)**:
  Sử dụng decorator `@Permissions()` truyền vào mã quyền từ enum.

  ```typescript
  import { Permissions } from '../../common/decorators/permissions.decorator';
  import { P } from '@workspace/database'; // Import Enum Quyền từ Database Package

  @Permissions(P.USER_CREATE)
  @Post()
  create() { ... }
  ```

### Cách thêm một Quyền (Resource Permission) mới:

1. Mở package Database: `packages/database/prisma/schema/enums.prisma` (hoặc file lưu enum permission).
2. Thêm giá trị mới vào enum `PermissionCode` (ví dụ: `NOTE_CREATE`).
3. Chạy lệnh: `pnpm db:generate`.
4. Gán quyền này vào Role của Admin/Agent trong file seed hoặc UI phân quyền.
5. Quay lại BE sử dụng `@Permissions(P.NOTE_CREATE)`.

---

## 3. Controller & Swagger API Docs

Mọi route phải được document chi tiết để Swagger gen ra giao diện API chuẩn xác. Cần khai báo Response Entity và DTO.

### Khai báo một Controller chuẩn:

```typescript
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseOf, ApiPaginatedResponseOf } from '../../common/entities/api-response.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Notes')
@ApiBearerAuth() // Dùng token
@Controller('notes')
export class NotesController {

  @ApiOperation({ summary: 'Lấy danh sách notes' })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(NoteListEntity) }) // Bọc trong PaginatedResponse
  @Get()
  findAll(@Query() query: PaginationQueryDto) { ... }

  @ApiOperation({ summary: 'Tạo note mới' })
  @ApiOkResponse({ type: ApiResponseOf(NoteDetailEntity) }) // Bọc trong ResponseOf
  @Post()
  create(@Body() dto: CreateNoteDto) { ... }
}
```

**Lưu ý**: Các `Entity` (ví dụ: `NoteDetailEntity`) được định nghĩa trong thư mục `entities/` của module đó, kế thừa hoặc mô tả lại schema Prisma sử dụng `@ApiProperty()`.

---

## 4. Tổ chức Dữ liệu dùng chung & Kiểu (Types)

- **Phân trang (Pagination)**:
  Luôn import `PaginationQueryDto` từ `src/common/dto/pagination-query.dto.ts`. Controller truyền `query` này xuống Service.
- **Hàm dùng chung (Utils)**:
  Tạo trong `src/utils/` (ví dụ: format date, generator ID).
- **Kiểu dữ liệu (Types/Interfaces)**:
  - Nếu là kiểu liên quan trực tiếp tới DB, **phải** import từ `@workspace/database`.
  - Nếu là kiểu riêng của BE (như Request payload, Socket payload), khai báo ở `src/common/interfaces/` hoặc `types/`.
- **Hằng số (Constants)**:
  Tạo trong `src/common/constants/`.

---

## 5. WebSockets (Socket.io)

Tất cả cấu hình Socket nằm trong thư mục `src/websocket/`.

- Sử dụng `@nestjs/websockets`.
- Khi một sự kiện nghiệp vụ xảy ra ở Service (ví dụ gửi tin nhắn xong), **không** nhúng thẳng logic emit socket vào Service đó. Thay vào đó:
  1. Service phát ra một Event nội bộ (`@nestjs/event-emitter`).
  2. `SocketGateway` (hoặc Listener tương ứng trong `src/websocket/`) sẽ catch event đó và gọi `server.emit()` hoặc `server.to(room).emit()`.
- Room: Thường được gom nhóm theo `conversation_id` hoặc `account_id` để tối ưu số lượng user nhận sự kiện.

Tài liệu tham khảo
Xác thực facebook: https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow#exchangecode
https://developers.facebook.com/documentation/facebook-login/guides/access-tokens/get-long-lived
