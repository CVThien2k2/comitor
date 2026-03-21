import type { Metadata } from "next"

export const ROUTES = {
  "sign-in": {
    path: "/login",
    metadata: {
      title: "Đăng nhập - Comitor",
      description: "Nhập thông tin để truy cập hệ thống",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "forgot-password": {
    path: "/forgot-password",
    metadata: {
      title: "Quên mật khẩu - Comitor",
      description: "Khôi phục mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "reset-password": {
    path: "/reset-password",
    metadata: {
      title: "Đặt lại mật khẩu - Comitor",
      description: "Đặt lại mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  conversations: {
    path: "/conversations",
    metadata: {
      title: "Hội thoại - Comitor",
      description: "Hội thoại",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
} as const
