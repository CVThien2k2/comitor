import type { Metadata } from "next"

export const ROUTES = {
  "sign-in": {
    path: "/login",
    metadata: {
      title: "Đăng nhập",
      description: "Nhập thông tin để truy cập hệ thống",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "forgot-password": {
    path: "/forgot-password",
    metadata: {
      title: "Quên mật khẩu",
      description: "Khôi phục mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  "reset-password": {
    path: "/reset-password",
    metadata: {
      title: "Đặt lại mật khẩu",
      description: "Đặt lại mật khẩu tài khoản của bạn",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  conversations: {
    path: "/conversations",
    metadata: {
      title: "Danh sách hội thoại",
      description: "Danh sách hội thoại",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
  conversationDetail: {
    path: "/conversations/:id",
    metadata: {
      title: "Chi tiết cuộc hội thoại",
      description: "Chi tiết cuộc hội thoại",
      robots: "noindex, nofollow",
    } satisfies Metadata,
  },
} as const
