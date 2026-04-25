"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeToggle } from "@/components/global/theme-toggle"
import {
  filterNavItemsByPermissions,
  getResolvedMainNavItems,
  getResolvedSettingsNavItems,
  isNavItemActive,
  type ResolvedAppNavItem,
} from "@/lib/app-navigation"
import { Icons } from "@/components/global/icons"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"
import { UserProfile } from "./user-profile"

interface SidebarContentProps {
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarContent({ pathname, collapsed, onNavigate }: SidebarContentProps) {
  const permissions = useAuthStore((state) => state.permissions)
  const visibleMainNavItems = React.useMemo(
    () => filterNavItemsByPermissions(getResolvedMainNavItems(), permissions),
    [permissions]
  )
  const visibleSettingsNavItems = React.useMemo(
    () => filterNavItemsByPermissions(getResolvedSettingsNavItems(), permissions),
    [permissions]
  )

  return (
    <>
      <div className={cn("mb-6 flex h-16 items-center", collapsed ? "justify-center px-3" : "gap-3 px-4")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          CH
        </div>
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Elines OS</span>
          <span className="text-[11px] text-muted-foreground">Knowledge System</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {visibleMainNavItems.map((item) => (
            <SidebarNavItem
              key={item.href ?? item.label}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-2">
        <div className="mb-2">
          <ThemeToggle collapsed={collapsed} />
        </div>

        <div className="space-y-1">
          {visibleSettingsNavItems.map((item) => (
            <SidebarNavItem
              key={item.href ?? item.label}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <UserProfile collapsed={collapsed} />
      </div>
    </>
  )
}

interface SidebarNavItemProps {
  item: ResolvedAppNavItem
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNavItem({ item, pathname, collapsed, onNavigate }: SidebarNavItemProps) {
  const hasChildren = !!item.children?.length
  const active = isNavItemActive(item, pathname)
  const [expanded, setExpanded] = React.useState(active)

  React.useEffect(() => {
    if (active) {
      setExpanded(true)
    }
  }, [active])

  if (hasChildren) {
    return (
      <NavGroup
        item={item}
        active={active}
        expanded={expanded}
        collapsed={collapsed}
        onToggle={() => setExpanded((value) => !value)}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    )
  }

  return <NavLink item={item} isActive={active} collapsed={collapsed} onClick={onNavigate} />
}

interface NavGroupProps {
  item: ResolvedAppNavItem
  active: boolean
  expanded: boolean
  collapsed: boolean
  onToggle: () => void
  pathname: string
  onNavigate?: () => void
}

function NavGroup({ item, active, expanded, collapsed, onToggle, pathname, onNavigate }: NavGroupProps) {
  const Icon = item.icon ?? Icons.circle
  const badgeCount = useBadgeCount(item.badgeKey)
  const badges = useAppStore((s) => s.badges)

  const trigger = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-linear-to-r from-indigo-400/45 to-purple-500/45 shadow-sm hover:from-indigo-400/55 hover:to-purple-500/55"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        collapsed && "justify-center px-2"
      )}
      aria-expanded={expanded}
    >
      <div className="relative flex h-[18px] w-[18px] items-center justify-center">
        <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active && "text-primary")} />
        {collapsed && badgeCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
      </div>

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {badgeCount > 0 && (
            <Badge className="h-5 min-w-5 bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
          <Icons.chevronRight
            className={cn("h-4 w-4 shrink-0 transition-transform duration-200 ease-out", expanded && "rotate-90")}
          />
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">{trigger}</div>
        </TooltipTrigger>
        <TooltipContent side="right" align="start">
          <div className="space-y-1">
            {item.children?.map((child) => {
              const childActive = isNavItemActive(child, pathname)
              const childBadgeCount = child.badgeKey ? badges[child.badgeKey] : 0
              const ChildIcon = child.icon ?? Icons.circle

              return (
                <Link
                  key={child.href ?? child.label}
                  href={child.href ?? "#"}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-background transition-colors",
                    childActive ? "bg-background/14 text-background" : "hover:bg-background/10"
                  )}
                >
                  <ChildIcon
                    className={cn("h-4 w-4 shrink-0", childActive ? "text-background" : "text-background/80")}
                  />
                  <span className="flex-1 truncate">{child.label}</span>
                  {childBadgeCount > 0 && (
                    <Badge className="h-4 bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                      {childBadgeCount > 99 ? "99+" : childBadgeCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="space-y-1">
      {trigger}
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-250 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="ml-4 border-l border-sidebar-border/80 pl-2">
            <div className="space-y-1 py-1">
              {item.children?.map((child) => (
                <NavChildLink
                  key={child.href ?? child.label}
                  item={child}
                  isActive={isNavItemActive(child, pathname)}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavLinkProps {
  item: ResolvedAppNavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavLink({ item, isActive, collapsed, onClick }: NavLinkProps) {
  const Icon = item.icon ?? Icons.circle
  const badgeCount = useBadgeCount(item.badgeKey)
  const href = item.href ?? "#"

  const linkContent = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-linear-to-r from-indigo-400/45 to-purple-500/45 shadow-sm hover:from-indigo-400/55 hover:to-purple-500/55"
          : "text-sidebar-foreground/70 hover:bg-linear-to-r hover:from-indigo-400/12 hover:to-purple-500/12 hover:text-sidebar-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="relative flex h-[18px] w-[18px] items-center justify-center">
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            isActive && "text-indigo-600 dark:text-indigo-300"
          )}
        />
        {collapsed && badgeCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
      </div>

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {badgeCount > 0 && (
            <Badge className="h-5 min-w-5 bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">{linkContent}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {badgeCount > 0 && (
            <Badge className="h-4 bg-primary px-1.5 text-[10px] text-primary-foreground">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

function NavChildLink({ item, isActive, onClick }: { item: ResolvedAppNavItem; isActive: boolean; onClick?: () => void }) {
  const badgeCount = useBadgeCount(item.badgeKey)
  const href = item.href ?? "#"

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
        isActive
          ? "bg-primary/8 text-sidebar-foreground/80"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current opacity-60 transition-all duration-200",
          isActive && "scale-110 bg-primary opacity-100"
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {badgeCount > 0 && (
        <Badge className="h-5 min-w-5 bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {badgeCount > 99 ? "99+" : badgeCount}
        </Badge>
      )}
    </Link>
  )
}

function useBadgeCount(badgeKey?: ResolvedAppNavItem["badgeKey"]) {
  return useAppStore((s) => (badgeKey ? s.badges[badgeKey] : 0))
}
