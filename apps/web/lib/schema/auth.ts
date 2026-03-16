import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
})

export type LoginSchema = z.infer<typeof loginSchema>
