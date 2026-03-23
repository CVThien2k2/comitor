"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { ThemeToggle } from "@/components/global/theme-toggle"
import { APP_SETTINGS_NAV_ITEM, getSidebarMainNavItems, type AppNavItem } from "@/lib/app-navigation"
import { UserProfile } from "./user-profile"
import { useAppStore } from "@/stores/app-store"

const SIDEBAR_MAIN_NAV_ITEMS = getSidebarMainNavItems()

type SidebarMode = "full" | "rail" | "overlay"

interface AppSidebarProps {
  mode?: SidebarMode
  collapsed?: boolean
  onToggle?: () => void
  onExpand?: () => void
  onClose?: () => void
  onNavigate?: () => void
}

export function AppSidebar({
  mode = "full",
  collapsed = false,
  onToggle,
  onExpand,
  onClose,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname()

  // Determine if we should show collapsed view
  const isCollapsed = mode === "rail" || (mode === "full" && collapsed)
  const showLabels = mode === "overlay" || (mode === "full" && !collapsed)

  const handleLinkClick = () => {
    onNavigate?.()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
          mode === "rail" && "w-16",
          mode === "overlay" && "w-[220px] shadow-2xl",
          mode === "full" && (collapsed ? "w-[68px]" : "w-[220px]")
        )}
      >
        {/* Logo Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            isCollapsed && !showLabels ? "justify-center" : "gap-3"
          )}
        >
          {/* Rail expand button */}
          {mode === "rail" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onExpand}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  CH
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Mở rộng menu</TooltipContent>
            </Tooltip>
          )}

          {/* Overlay close button + logo */}
          {mode === "overlay" && (
            <>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent"
              >
                <Icons.x className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  CH
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Elines OS</span>
                  <span className="text-[11px] text-muted-foreground">Knowledge System</span>
                </div>
              </div>
            </>
          )}

          {/* Full mode logo */}
          {mode === "full" && (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                CH
              </div>
              <div
                className={cn(
                  "flex flex-col overflow-hidden transition-all duration-300",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Elines OS</span>
                <span className="text-[11px] text-muted-foreground">Knowledge System</span>
              </div>
            </>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {SIDEBAR_MAIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={isCollapsed && !showLabels}
                onClick={handleLinkClick}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border px-3 py-2">
          {/* Theme Toggle */}
          <div className="mb-2">
            <ThemeToggle collapsed={isCollapsed && !showLabels} />
          </div>

          {/* Settings */}
          <div className="space-y-1">
            {[APP_SETTINGS_NAV_ITEM].map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                collapsed={isCollapsed && !showLabels}
                onClick={handleLinkClick}
              />
            ))}
          </div>

          {/* User Profile */}
          <UserProfile collapsed={isCollapsed && !showLabels} />
        </div>

        {/* Collapse Toggle - only for full mode */}
        {mode === "full" && (
          <div className="border-t border-sidebar-border px-3 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={cn(
                "w-full justify-center text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                !collapsed && "justify-between"
              )}
            >
              {!collapsed && <span className="text-xs">Thu gọn</span>}
              {collapsed ? <Icons.chevronRight className="h-4 w-4" /> : <Icons.chevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}

interface NavLinkProps {
  item: AppNavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavLink({ item, isActive, collapsed, onClick }: NavLinkProps) {
  const Icon = item.icon
  const badgeCount = useAppStore((s) => (item.badgeKey ? s.badges[item.badgeKey] : 0))

  const linkContent = (
    <Link
      href={item.href}
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
