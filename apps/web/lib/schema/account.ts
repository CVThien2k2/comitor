import { z } from "zod"

const requiredText = (message: string) => z.string().trim().min(1, message)

const optionalText = z.string().trim().optional()

const baseAccountFormSchema = z.object({
  name: requiredText("Tên hiển thị không được để trống"),
  email: z.string().trim().email("Email không hợp lệ"),
  username: z.string().trim().optional(),
  password: z.string().optional(),
  phone: optionalText,
  avatarUrl: optionalText,
  roleId: z.string().trim().optional(),
  isActive: z.boolean(),
})

export const createAccountSchema = baseAccountFormSchema.extend({
  username: requiredText("Tên đăng nhập không được để trống"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
})

export const updateAccountSchema = baseAccountFormSchema.extend({
  username: z.string().trim().optional(),
  password: z.string().optional(),
})

export type CreateAccountSchema = z.infer<typeof createAccountSchema>
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>
export type AccountFormSchema = z.infer<typeof baseAccountFormSchema>
