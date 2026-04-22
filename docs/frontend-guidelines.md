# Hướng dẫn tổ chức Code Frontend (Next.js)

Tài liệu này quy định kiến trúc thư mục, chuẩn code, và cách quản lý state/API cho Frontend.

---

## 1. Cấu trúc thư mục (apps/web)

- `app/`: Chứa định tuyến (Routing) theo chuẩn Next.js App Router.
- `components/`: Chứa toàn bộ giao diện tái sử dụng.
  - `components/global/`: Các layout chung (Header, Layout, Wrapper).
  - `components/{feature}/`: Components riêng cho từng module (VD: `accounts`, `channels`, `table`).
  - **Lưu ý:** Không sử dụng `components/ui/`, toàn bộ UI core bắt buộc dùng từ package `@workspace/ui`.
- `hooks/`: Chỉ chứa các custom hooks hoặc API hooks khi **có từ 2 component trở lên cùng sử dụng chung**. Nếu hook/logic chỉ phục vụ cho 1 component duy nhất, hãy viết thẳng vào bên trong file của component đó.
- `lib/`: Các hàm dùng chung, cấu hình tiện ích (`axios.ts`, `socket.ts`, `helper.ts`).
  - `lib/constants/`: Cấu hình hằng số chung (Colors, Status).
  - `lib/types/`: Khai báo Type/Interface dùng chung toàn dự án.
  - `lib/schema/`: Khai báo các schema validation (ví dụ: `zod` schema) dùng chung.
- `stores/`: Cấu hình global state sử dụng **Zustand**.

---

## 2. API & Fetching Data

- **Instance API**: Sử dụng `axios` đã được config sẵn ở `lib/axios.ts` (Tự động gắn Token, xử lý refresh token, handle error).
- **React Query**: MỌI tác vụ fetch data đều phải bọc qua `@tanstack/react-query`. Không dùng `useEffect` kết hợp `axios` trực tiếp trong Component.
  
**Cách viết chuẩn ở hooks:**
```typescript
// hooks/use-notes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export const useNotes = (page = 1) => {
  return useQuery({
    queryKey: ['notes', page],
    queryFn: async () => {
      const { data } = await axios.get('/notes', { params: { page } });
      return data;
    }
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newNote) => axios.post('/notes', newNote),
    onSuccess: () => {
      // Invalidate để bảng tự fetch lại data
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
};
```

---

## 3. Tổ chức Code trong một Component

Áp dụng mô hình **Smart / Dumb Component**.
- **Smart Component (Container / Page)**: Nằm ở ngoài cùng, gọi Hooks API (React Query), lấy data từ Store (Zustand), và truyền xuống component con qua Props.
- **Dumb Component (UI)**: Nhận Props và chỉ chịu trách nhiệm render giao diện + emit sự kiện (Callback). Không tự ý gọi API.

### Xử lý Loading State:
- **Khi fetch dữ liệu lần đầu (Initial Load)**: Bắt buộc áp dụng `Skeleton` component (từ `@workspace/ui`) cho các danh sách (list), card để giữ khung giao diện thay vì dùng spinner.
- **Khi thao tác xử lý API (Submit/Mutation)**: Chủ động sử dụng hiệu ứng loading animation (trên nút bấm) hoặc dùng `toaster.loading` để thông báo tiến trình cho người dùng mà không block toàn bộ giao diện.

```tsx
// 1. Dùng Skeleton cho lần đầu tiên tải list
const { data, isLoading } = useNotes();
if (isLoading) return <NoteListSkeleton />;

// 2. Dùng Toaster loading khi call API (Submit action)
const onSubmit = (data) => {
  const toastId = toast.loading('Đang xử lý...');
  mutate(data, {
    onSuccess: () => toast.success('Thành công!', { id: toastId }),
    onError: () => toast.error('Có lỗi xảy ra', { id: toastId }),
  });
};
```

---

## 4. Sử dụng Tài nguyên chung

- **Icons**: Dùng thư viện `lucide-react`.
  ```tsx
  import { MessageCircle, Settings } from 'lucide-react';
  ```
- **Bảng dữ liệu (Table)**: Sử dụng base table từ `components/table/` kết hợp với `@tanstack/react-table` để xử lý sort, pagination.
- **Upload File**: Quản lý logic upload qua `lib/upload.ts` (gọi S3 pre-signed url hoặc upload trực tiếp API). Khi có component cần upload ảnh, tái sử dụng các hook upload thay vì viết lại hàm axios.

---

## 5. WebSockets

- **Khởi tạo**: Socket client được setup tại `lib/socket.ts`.
- **Lắng nghe sự kiện**: Logic bắt event được tách riêng vào thư mục `lib/socket-handlers/`.
- **Cập nhật State**: Khi có tin nhắn mới qua Socket, Socket Handler sẽ gọi các action của **Zustand Store** (ví dụ cập nhật số unread) hoặc dùng `queryClient.setQueryData()` của React Query để chèn thẳng message mới vào danh sách đang hiển thị mà không cần fetch lại API toàn bộ.
- **Constants Event**: Khai báo rõ tên các Event tại `lib/socket-events.ts`. Tránh hardcode string.
