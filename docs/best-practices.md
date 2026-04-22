# Best Practices: Nguyên tắc SOLID, Design Patterns & Design System

Tài liệu này tổng hợp các chuẩn mực lập trình và mẫu thiết kế (Design Patterns) áp dụng cho dự án Comitor. Việc tuân thủ các quy tắc này giúp dự án dễ bảo trì, dễ scale và hạn chế tối đa technical debt.

---

## 1. Nguyên tắc SOLID trong thực tế dự án

### 1.1. Single Responsibility Principle (SRP - Đơn trách nhiệm)
- **Frontend**: Một Component chỉ nên làm 1 việc. 
  - **Sai**: Một component vừa gọi API axios, vừa lưu state filter, vừa render UI table phức tạp.
  - **Đúng**: Tách logic gọi API ra custom hook (`hooks/use-conversations.ts`), truyền dữ liệu xuống các Dumb Component (như `<ConversationList />`).
- **Backend**: NestJS tuân thủ chuẩn này rất chặt qua mô hình:
  - `Controller`: Chỉ nhận Request, Validate bằng DTO, và trả về Response.
  - `Service`: Chứa Business Logic (Quy tắc nghiệp vụ).
  - `Database/Prisma`: Chỉ tương tác dữ liệu.

### 1.2. Open/Closed Principle (OCP - Đóng mở)
Mở rộng dễ dàng nhưng hạn chế sửa đổi code lõi.
- **Frontend**: Thay vì dùng hàng chục câu lệnh `if/else` để render các dạng nút khác nhau, hãy sử dụng **Composition** (Truyền `children`) hoặc khai báo **Variants** (qua thư viện `cva` trong `@workspace/ui`).
- **Backend**: Sử dụng các `Interceptor`, `Guard`, `Middleware` để thêm tính năng (như log, xác thực) thay vì chèn code vào từng hàm của Controller.

### 1.3. Liskov Substitution Principle (LSP - Thay thế Liskov)
- **Frontend**: Khi tạo một UI Component (ví dụ `<Button />`), nó vẫn phải nhận đầy đủ các props chuẩn của HTML element (như `onClick`, `disabled`, `type`). Kế thừa interface `React.ButtonHTMLAttributes<HTMLButtonElement>`.
- **Backend**: Đảm bảo các class implement cùng một interface có thể thay thế cho nhau mà không gây lỗi logic (Ví dụ: `ZaloProvider` và `FacebookProvider` đều implement chung interface `IChannelProvider`).

### 1.4. Interface Segregation Principle (ISP - Phân tách Interface)
Không ép component nhận những dữ liệu nó không dùng.
- **Frontend**: Nếu Component `<Avatar />` chỉ cần ảnh, đừng truyền nguyên cục object `User` nặng nề. Hãy truyền `avatarUrl: string`.
- **Backend**: Chia nhỏ các DTO. Dùng `PartialType`, `PickType`, `OmitType` của `@nestjs/swagger` để tái sử dụng thay vì tạo lại các Type khổng lồ.

### 1.5. Dependency Inversion Principle (DIP - Đảo ngược Dependency)
- **Backend**: Đây là "linh hồn" của NestJS. Chúng ta **KHÔNG BAO GIỜ** khởi tạo một class bằng từ khóa `new` (VD: `const service = new UserService()`). Thay vào đó, chúng ta inject qua Constructor (Dependency Injection Container).
- **Frontend**: Component không nên phụ thuộc cứng vào hàm fetch Axios. Thay vào đó, nó nên gọi Hook của React Query, để việc quản lý logic cache/fetch nằm ở lớp trừu tượng phía dưới.

---

## 2. Design Patterns Khuyên Dùng

### 2.1. Strategy Pattern (Backend)
- **Hoàn cảnh**: Hệ thống Omni-channel có nhiều nền tảng (Zalo, Facebook, Email, Webchat).
- **Áp dụng**: Thay vì dùng lệnh `switch (channelType)` chạy dài, hãy tạo ra các "Strategy" class (e.g., `ZaloChannelService`, `FbChannelService`) tuân theo một interface chung. Inject chúng động qua Factory.

### 2.2. Observer / Pub-Sub Pattern (Backend)
- **Hoàn cảnh**: Khi xử lý xong tin nhắn, cần lưu DB, vừa cần báo Socket, vừa cần update Elasticsearch.
- **Áp dụng**: Dùng module `@nestjs/event-emitter`. Service chính chỉ cần bắn event: `eventEmitter.emit('message.created', payload)`. Các module khác (như WebSockets Gateway) dùng `@OnEvent('message.created')` để tự lắng nghe. Tránh việc các module phụ thuộc chéo (Circular Dependency).

### 2.3. CQRS Pattern (Command Query Responsibility Segregation - Backend)
- **Hoàn cảnh**: Ứng dụng chat có lượng READ (truy xuất tin nhắn) cực kỳ lớn, trong khi WRITE (gửi tin) phức tạp (cần check quyền, spam, gọi Queue).
- **Áp dụng**: Sử dụng `@nestjs/cqrs`. Tách biệt rạch ròi 2 luồng: `Queries` (chỉ chọc vào DB để lấy data, có thể áp dụng Redis Cache mạnh mẽ) và `Commands` (thực thi logic insert/update DB và bắn event).

### 2.4. Factory Pattern (Backend)
- **Hoàn cảnh**: Bạn cần khởi tạo kết nối API tới Zalo, nhưng mỗi `LinkAccount` lại có AppID và Secret Key khác nhau lưu trong DB.
- **Áp dụng**: Viết một `ChannelProviderFactory`. Truyền `accountId` vào Factory, nó sẽ tự đọc DB, cấu hình header/token tương ứng và trả về một instance SDK chuẩn bị sẵn sàng để gọi API.

### 2.5. Transactional Outbox Pattern (Hệ thống phân tán)
- **Hoàn cảnh**: Khi lưu tin nhắn vào DB, đồng thời bạn đẩy job "Gửi tin qua Zalo" vào BullMQ. Nếu DB lưu thành công nhưng máy chủ Redis/Queue sập thì sao? Tin nhắn bị kẹt vĩnh viễn.
- **Áp dụng**: Mọi thao tác ghi phải thực hiện trong 1 Transaction. Ghi cả `Message` và 1 bản ghi `OutboxEvent` vào DB. Sau đó có 1 Worker chạy ngầm đọc `OutboxEvent` để đẩy vào BullMQ. Đảm bảo tính nhất quán dữ liệu (Data Consistency).

### 2.6. Smart & Dumb Component Pattern (Frontend)
- **Smart (Container)**: Xử lý logic, gọi API (React Query), connect Zustand. Không chứa mã CSS hay thẻ div phức tạp.
- **Dumb (Presentational)**: Các component ở `@workspace/ui`. Nhận `props` vào và render ra UI. Nhận `callbacks` (`onDelete`, `onUpdate`) để tương tác ngược lại. Giúp code giao diện tái sử dụng tối đa.

### 2.7. Compound Components (Frontend)
- **Hoàn cảnh**: Các UI có nhiều thành phần tương tác chặt chẽ (Dropdown, Tabs, Accordion). Việc truyền props quá sâu (Prop Drilling) làm code rối.
- **Áp dụng**: Cung cấp một tập hợp các Component con chia sẻ chung Context. Đây là pattern mà `@workspace/ui` (Radix) đang dùng rất nhiều.
  Ví dụ: `<DropdownMenu>`, `<DropdownMenuTrigger>`, `<DropdownMenuContent>`... Không nên cố "nhét" mọi thứ vào 1 component `<CustomDropdown />` với hàng tá props.

---

## 3. Design System & Chuẩn mực UI

### 3.1. Nguồn gốc Giao diện (The Source of Truth)
- Tuyệt đối không tự định nghĩa nút `<button>`, ô nhập `<input>` hay `<table>` chay bằng thẻ HTML nguyên thủy trong màn hình chính.
- Mọi component cơ bản bắt buộc được import từ `@workspace/ui` (vốn được sinh ra từ Shadcn UI / Radix). Điều này đảm bảo tính Accessibility (a11y) và đồng nhất giao diện toàn hệ thống.

### 3.2. Design Tokens (Tailwind)
- **Tuyệt đối cấm** việc hardcode mã màu HEX trực tiếp trong class (VD: `text-[#FF0000]`).
- Phải dùng **Design Tokens** đã được quy định trong cấu hình Tailwind của hệ thống:
  - Dùng màu hệ thống: `bg-primary`, `text-destructive`, `border-border`.
  - Margin/Padding: Sử dụng theo scale số nguyên của Tailwind (`p-2`, `m-4`) để duy trì tỷ lệ hệ thống (Spacing System).

### 3.3. Xử lý Trạng thái (Feedback UI)
- Trạng thái trống (Empty State): Luôn có Component mô tả khi dữ liệu bằng 0.
- Trạng thái chờ (Loading State): Xem nguyên tắc Skeleton và Toaster trong `frontend-guidelines.md`.
- Lỗi (Error State): Xử lý lỗi API tinh tế qua Error Boundaries hoặc toast hiển thị thông báo thân thiện với người dùng, tuyệt đối không crash màn hình.

---

## 4. Tính toàn vẹn Dữ liệu (ACID) & Xử lý Đồng thời (Concurrency)

Hệ thống Omnichannel Message phải hứng chịu một lượng lớn Request đồng thời (đặc biệt từ Webhook). Việc tuân thủ ACID và xử lý Race Condition là **bắt buộc**.

### 4.1. Atomicity & "Không dừng giữa chừng" (Transactions)
- **Quy tắc**: Một quy trình nghiệp vụ (Business Flow) nếu tác động đến nhiều bảng hoặc nhiều dòng dữ liệu, thì **bắt buộc** phải thành công toàn bộ, hoặc thất bại toàn bộ (Rollback). Không được phép để xảy ra tình trạng "dừng giữa chừng" (Ví dụ: Trừ tiền khách thành công nhưng chưa tạo hóa đơn, hoặc ghép Golden Profile xong nhưng chưa cập nhật cờ `isLinked` ở AccountCustomer).
- **Áp dụng (Prisma)**: Sử dụng Interactive Transactions (`prisma.$transaction`).
```typescript
// Đúng:
await this.prisma.$transaction(async (tx) => {
  const profile = await tx.goldenProfile.create({ data: {...} });
  await tx.accountCustomer.update({ where: { id }, data: { goldenProfileId: profile.id } });
}); // Nếu update lỗi, create phía trên tự động bị hủy (Rollback).
```

### 4.2. Xử lý Race Condition tại Database
- **Hoàn cảnh**: Khách hàng (hoặc tool spam) gửi 5 tin nhắn cùng 1 mili-giây. Webhook kích hoạt 5 instances chạy song song. Cả 5 instances đều gọi `findFirst` không thấy Conversation, và đều tự ý `create` sinh ra 5 Conversation trùng lặp cho cùng 1 khách hàng.
- **Áp dụng (Quy chuẩn code)**:
  - **Dùng Upsert thay cho Find-then-Create**: Prisma cung cấp hàm `upsert` hoạt động nguyên tử (Atomic) ở tầng Database. Luôn dùng `upsert` để tìm/tạo dữ liệu duy nhất thay vì if/else.
  - **Sử dụng Index & Unique Constraint**: Phải có `@@unique` constraint ở cấp độ Schema (ví dụ `@@unique([accountId, linkedAccountId])`). Kể cả khi logic code bị lọt khe, Database sẽ quăng lỗi `P2002 Unique Constraint Failed`, ta có thể `catch` và handle an toàn thay vì sinh ra rác dữ liệu.

### 4.3. Distributed Locking (Khóa phân tán với Redis)
- **Hoàn cảnh**: Có những tác vụ phức tạp không thể gói gọn trong 1 lệnh `upsert` hoặc lệnh Transaction thông thường. Ví dụ: Tính toán điểm thưởng Loyalty Points phức tạp dựa trên lịch sử hội thoại khi xử lý Webhook.
- **Áp dụng**: Sử dụng khóa phân tán qua Redis (Redlock hoặc `ioredis` set NX).
```typescript
const lockKey = `lock:webhook:zalo:${messageId}`;
const acquired = await this.redisService.setnx(lockKey, '1', 'EX', 5); // Khóa trong 5 giây
if (!acquired) {
  // Bỏ qua hoặc cho vào queue xử lý sau, vì đã có instance khác đang xử lý messageId này rồi.
  return;
}
try {
  // Thực thi logic nghiệp vụ nặng
} finally {
  await this.redisService.del(lockKey); // Mở khóa
}
```

### 4.4. Idempotency (Tính Lũy đẳng)
- **Quy tắc**: Các API quan trọng (đặc biệt là API nhận Webhook hoặc API thao tác tài chính/gửi tin nhắn bên thứ 3) phải là **Idempotent**. Nghĩa là việc gọi hàm 1 lần hay 100 lần với cùng 1 payload đều chỉ sinh ra **duy nhất 1 kết quả/tác động**.
- **Áp dụng**: 
  - Lưu lại `external_message_id` từ Zalo vào DB và đánh index unique.
  - Khi nhận Webhook, check `external_message_id`. Nếu đã tồn tại, lập tức return HTTP 200 OK và bỏ qua việc xử lý. Hạn chế tối đa side-effect (gửi trùng thông báo Notification hoặc gửi trùng tin nhắn).
