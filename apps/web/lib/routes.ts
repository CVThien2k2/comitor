import type { Metadata } from "next"

export const ROUTES = {
  "sign-in": {
    path: "/auth/login",
    metadata: {
      title: "Đăng nhập - Comitor",
      description: "Nhập thông tin để truy cập hệ thống",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "forgot-password": {
    path: "/auth/forgot-password",
    metadata: {
      title: "Quên mật khẩu - Comitor",
      description: "Khôi phục mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "reset-password": {
    path: "/auth/reset-password",
    metadata: {
      title: "Đặt lại mật khẩu - Comitor",
      description: "Đặt lại mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
} as const
