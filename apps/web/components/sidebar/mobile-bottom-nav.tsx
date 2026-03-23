"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { Icons } from "@/components/global/icons"
import { Badge } from "@workspace/ui/components/badge"
import { useTheme } from "next-themes"
import {
  APP_SETTINGS_NAV_ITEM,
  getMobileOverflowNavItems,
  getMobilePrimaryNavItems,
  type AppNavItem,
} from "@/lib/app-navigation"
import { useAppStore } from "@/stores/app-store"

const mobilePrimaryNavItems = getMobilePrimaryNavItems()
const mobileMoreNavItems = [...getMobileOverflowNavItems(), APP_SETTINGS_NAV_ITEM]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isMoreActive = mobileMoreNavItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="safe-area-pb fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-around px-2">
          {mobilePrimaryNavItems.map((item) => (
            <BottomNavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icons.moreHorizontal className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Thêm</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50 bg-black/50 transition-opacity" onClick={() => setSheetOpen(false)} />

          {/* Sheet */}
          <div className="fixed right-0 bottom-0 left-0 z-50 animate-in rounded-t-2xl bg-background shadow-2xl duration-300 slide-in-from-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 pb-3">
              <h3 className="font-semibold text-foreground">Menu</h3>
              <button onClick={() => setSheetOpen(false)} className="rounded-lg p-2 transition-colors hover:bg-muted">
                <Icons.x className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="max-h-[60vh] space-y-1 overflow-y-auto px-3 py-4">
              {mobileMoreNavItems.map((item) => (
                <SheetNavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  onClick={() => setSheetOpen(false)}
                />
              ))}

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <div className="relative h-6 w-6">
                    <Icons.sun
                      className={cn(
                        "absolute inset-0 h-6 w-6 transition-all duration-300",
                        resolvedTheme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                      )}
                    />
                    <Icons.moon
                      className={cn(
                        "absolute inset-0 h-6 w-6 transition-all duration-300",
                        resolvedTheme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                      )}
                    />
                  </div>
                  <span className="text-sm font-medium">{resolvedTheme === "dark" ? "Chế độ sáng" : "Chế độ tối"}</span>
                </button>
              )}
            </div>

            {/* Safe area padding */}
            <div className="h-6" />
          </div>
        </>
      )}
    </>
  )
}

function BottomNavItem({ item, isActive }: { item: AppNavItem; isActive: boolean }) {
  const Icon = item.icon
  const badgeCount = useAppStore((s) => (item.badgeKey ? s.badges[item.badgeKey] : 0))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  )
}

function SheetNavItem({ item, isActive, onClick }: { item: AppNavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon
  const badgeCount = useAppStore((s) => (item.badgeKey ? s.badges[item.badgeKey] : 0))

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl px-4 py-3 transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{item.label}</span>
      {badgeCount > 0 && (
        <Badge className="ml-auto h-5 bg-primary px-2 text-[10px] text-primary-foreground">
          {badgeCount > 99 ? "99+" : badgeCount}
        </Badge>
      )}
    </Link>
  )
}
