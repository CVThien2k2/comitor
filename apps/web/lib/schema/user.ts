import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Vui lòng chọn vai trò"),
})

export type CreateUserForm = z.infer<typeof createUserSchema>
