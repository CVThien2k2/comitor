import type { ElementType } from "react"
import type { GroupKey, PermissionCode } from "@workspace/database"
import { Icons } from "@/components/global/icons"
import { AppData } from "@/api"

export interface AppNavItem {
  label: string
  icon?: ElementType
  href?: string
  badgeKey?: keyof AppData["badges"]
  children?: AppNavItem[]
  key?: GroupKey
  isDisabled?: boolean
}

export interface ResolvedAppNavItem extends Omit<AppNavItem, "children"> {
  href?: string
  children?: ResolvedAppNavItem[]
}

/**
 * Danh sách điều hướng chính — dùng chung cho sidebar (mọi breakpoint) và mobile.
 */
export const APP_MAIN_NAV_ITEMS: AppNavItem[] = [
  {
    label: "Hội thoại",
    icon: Icons.inbox,
    href: "/conversations",
    badgeKey: "conversationsUnreadCount",
    key: "conversation",
  },
  { label: "Kênh kết nối", icon: Icons.radio, href: "/links" },
  {
    label: "Người dùng",
    icon: Icons.user,
    href: "/users",
    key: "user",
    children: [
      { label: "Tạo mới", href: "/create", isDisabled: true },
      { label: "Chi tiết", href: "/{id}", isDisabled: true },
      { label: "Chỉnh sửa", href: "/{id}/update", isDisabled: true },
    ],
  },
  {
    label: "Khách hàng",
    icon: Icons.users,
    children: [
      { label: "Hồ sơ", icon: Icons.users, href: "/golden-profiles" },
      { label: "Tài khoản", icon: Icons.user, href: "/account-customers" },
    ],
    key: "customer",
  },
  {
    label: "Quản lý hệ thống",
    icon: Icons.shield,
    children: [
      { label: "Vai trò", icon: Icons.shield, href: "/roles", key: "role" },
      { label: "Hành động", icon: Icons.user, href: "/permissions", key: "permission" },
      { label: "Tin nhắn gợi ý", icon: Icons.messageSquare, href: "/suggested-messages", key: "suggested-message" },
      { label: "Cấp độ nhân viên", icon: Icons.shield, href: "/agent-levels", key: "agent-level" },
    ],
  },
]

export const APP_SETTINGS_NAV_ITEM: AppNavItem[] = [
  {
    label: "Cài đặt",
    icon: Icons.settings,
    href: "/settings",
  },
]

export function getResolvedMainNavItems() {
  return resolveNavItems(APP_MAIN_NAV_ITEMS)
}

export function getResolvedSettingsNavItems() {
  return resolveNavItems(APP_SETTINGS_NAV_ITEM)
}

export function getResolvedAppNavItems() {
  return [...getResolvedMainNavItems(), ...getResolvedSettingsNavItems()]
}

export function filterNavItemsByPermissions(
  items: ResolvedAppNavItem[],
  permissions: PermissionCode[]
): ResolvedAppNavItem[] {
  return items.flatMap((item) => {
    if (item.isDisabled) {
      return []
    }

    if (item.key && !hasGroupPermission(item.key, permissions)) {
      return []
    }

    const filteredChildren = item.children?.length ? filterNavItemsByPermissions(item.children, permissions) : undefined

    if (item.children?.length && (!filteredChildren || filteredChildren.length === 0) && !item.href) {
      return []
    }

    return [{ ...item, children: filteredChildren }]
  })
}

export function findNavTrail(items: ResolvedAppNavItem[], pathname: string): ResolvedAppNavItem[] {
  for (const item of items) {
    if (item.children?.length) {
      const childTrail = findNavTrail(item.children, pathname)
      if (childTrail.length > 0) {
        return [item, ...childTrail]
      }
    }

    if (item.href && isPathMatch(item.href, pathname)) {
      return [item]
    }
  }

  return []
}

export function isNavItemActive(item: ResolvedAppNavItem, pathname: string): boolean {
  if (item.href && isPathMatch(item.href, pathname)) {
    return true
  }

  return item.children?.some((child) => isNavItemActive(child, pathname)) ?? false
}

export function getBreadcrumbItems(pathname: string) {
  const navTrail = findNavTrail(getResolvedAppNavItems(), pathname)
  const items = navTrail.map((item) => ({
    label: item.label,
    href: item.href,
  }))

  const lastMatchedHref = navTrail.at(-1)?.href
  const fallbackSegments = getFallbackSegments(pathname, lastMatchedHref)

  return [...items, ...fallbackSegments]
}

function resolveNavItems(items: AppNavItem[], parentHref?: string): ResolvedAppNavItem[] {
  return items.map((item) => {
    const href = resolveNavHref(item.href, parentHref)

    return {
      ...item,
      href,
      children: item.children?.length ? resolveNavItems(item.children, href) : undefined,
    }
  })
}

function resolveNavHref(href?: string, parentHref?: string) {
  if (!href) return undefined
  if (/^[a-z]+:\/\//i.test(href)) return href
  if (!parentHref) return href

  const base = parentHref.endsWith("/") ? parentHref.slice(0, -1) : parentHref
  const child = href.startsWith("/") ? href : `/${href}`

  return `${base}${child}`
}

function getFallbackSegments(pathname: string, matchedHref?: string) {
  const pathSegments = pathname.split("/").filter(Boolean)
  const matchedSegments = matchedHref?.split("/").filter(Boolean).length ?? 0

  return pathSegments.slice(matchedSegments).map((segment, index, arr) => {
    const href = `/${pathSegments.slice(0, matchedSegments + index + 1).join("/")}`

    return {
      label: decodeURIComponent(segment).toUpperCase(),
      href: index === arr.length - 1 ? undefined : href,
    }
  })
}

function hasGroupPermission(group: GroupKey, permissions: PermissionCode[]) {
  const permissionSet = new Set<string>(permissions)

  return (
    permissionSet.has("*") ||
    permissionSet.has(`${group}:*`) ||
    permissionSet.has(`${group}:view`) ||
    permissionSet.has(`${group}:read`)
  )
}

function isPathMatch(href: string, pathname: string) {
  const hrefSegments = href.split("/").filter(Boolean)
  const pathnameSegments = pathname.split("/").filter(Boolean)

  if (hrefSegments.length > pathnameSegments.length) {
    return false
  }

  return hrefSegments.every((segment, index) => {
    const current = pathnameSegments[index]
    return isDynamicSegment(segment) ? current !== undefined : segment === current
  })
}

function isDynamicSegment(segment: string) {
  return segment.startsWith("{") && segment.endsWith("}")
}
