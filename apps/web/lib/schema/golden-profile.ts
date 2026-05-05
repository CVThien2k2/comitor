import { z } from "zod"

const emailSchema = z.string().email("Email không hợp lệ")

export const editGoldenProfileSchema = z.object({
  fullName: z.string().trim().max(255, "Họ và tên tối đa 255 ký tự"),
  gender: z.enum(["male", "female", "other"]).or(z.literal("")),
  dateOfBirth: z.string().max(10, "Ngày sinh không hợp lệ"),
  primaryPhone: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự"),
  primaryEmail: z
    .string()
    .trim()
    .max(100, "Email tối đa 100 ký tự")
    .refine((value) => !value || emailSchema.safeParse(value).success, "Email không hợp lệ"),
  address: z.string().trim().max(500, "Địa chỉ tối đa 500 ký tự"),
  city: z.string().trim().max(100, "Tỉnh/Thành phố tối đa 100 ký tự"),
  memberTier: z.enum(["bronze", "silver", "gold", "platinum"]).or(z.literal("")),
  loyaltyPoints: z.number().int("Điểm tích lũy phải là số nguyên").min(0, "Điểm tích lũy không được âm"),
  customerType: z.enum(["individual", "business", "agent"]),
  elinesCustomerId: z.string().trim().max(50, "Mã eLines tối đa 50 ký tự"),
  isBlacklisted: z.boolean(),
  journeyState: z.enum(["searching", "holding", "ticketed", "completed", "cancelled"]).or(z.literal("")),
  characteristics: z.string().trim().max(1000, "Đặc điểm tối đa 1000 ký tự"),
  staffNotes: z.string().trim().max(2000, "Ghi chú nội bộ tối đa 2000 ký tự"),
})

export type EditGoldenProfileSchema = z.infer<typeof editGoldenProfileSchema>
