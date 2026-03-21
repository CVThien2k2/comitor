import type { ElementType } from "react"
import { Icons } from "@/components/global/icons"

export interface AppNavItem {
  label: string
  icon: ElementType
  href: string
  badge?: number
  /** Hiển thị trên thanh tab mobile (tối đa 4 mục đầu có cờ này) */
  mobileTab?: boolean
  /**
   * `false` = ẩn khỏi sidebar desktop (route chưa sẵn sàng hoặc chỉ mở từ mobile).
   * Mặc định hiển thị trên sidebar.
   */
  showInSidebar?: boolean
}

/**
 * Danh sách điều hướng chính — dùng chung cho sidebar (mọi breakpoint) và mobile.
 */
export const APP_MAIN_NAV_ITEMS: AppNavItem[] = [
  { label: "Hội thoại", icon: Icons.inbox, href: "/conversations", badge: 12, mobileTab: true },
  { label: "Kênh kết nối", icon: Icons.radio, href: "/links", mobileTab: true },
  {
    label: "Khách hàng",
    icon: Icons.users,
    href: "/customers",
    mobileTab: true,
  },
  { label: "Tài khoản", icon: Icons.user, href: "/accounts" },
  { label: "Phân quyền", icon: Icons.shield, href: "/permissions" },
  { label: "Thông báo", icon: Icons.bell, href: "/notifications" },
]

export const APP_SETTINGS_NAV_ITEM: AppNavItem = {
  label: "Cài đặt",
  icon: Icons.settings,
  href: "/settings",
}

const MOBILE_TAB_MAX = 4

export function getMobilePrimaryNavItems(): AppNavItem[] {
  return APP_MAIN_NAV_ITEMS.filter((item) => item.mobileTab).slice(0, MOBILE_TAB_MAX)
}

export function getMobileOverflowNavItems(): AppNavItem[] {
  const primaryHrefs = new Set(getMobilePrimaryNavItems().map((i) => i.href))
  return APP_MAIN_NAV_ITEMS.filter((item) => !primaryHrefs.has(item.href))
}

/** Mục hiển thị trong cột điều hướng chính của sidebar */
export function getSidebarMainNavItems(): AppNavItem[] {
  return APP_MAIN_NAV_ITEMS.filter((item) => item.showInSidebar !== false)
}
