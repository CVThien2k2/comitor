"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Inbox,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { auth } from "@/api/auth"
import { useAuthStore } from "@/stores/auth-store"

interface ChatSidebarProps {
  onToggle?: () => void
  isOpen?: boolean
}

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: <Inbox className="h-5 w-5 shrink-0" />, label: "Hộp thư đến", href: "/conversations" },
  { icon: <Users className="h-5 w-5 shrink-0" />, label: "Quản lí người dùng", href: "/users" },
]

export function ChatSidebar({ onToggle, isOpen = true }: ChatSidebarProps) {
  const isCollapsed = !isOpen
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useTheme()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement | null>(null)

  const themeLabel = useMemo(() => {
    if (theme === "light") return "Sáng"
    if (theme === "dark") return "Tối"
    return "Hệ thống"
  }, [theme])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const el = settingsRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setSettingsOpen(false)
    }

    if (!settingsOpen) return
    window.addEventListener("mousedown", onMouseDown)
    return () => window.removeEventListener("mousedown", onMouseDown)
  }, [settingsOpen])

  const handleLogout = async () => {
    try {
      await auth.logout()
    } finally {
      logout()
      router.push("/login")
    }
  }

  // Collapsed: icon-only bar
  if (isCollapsed) {
    return (
      <nav className="relative flex h-full w-12 min-w-12 shrink-0 flex-col border-r bg-background">
        <div className="flex shrink-0 flex-col items-center gap-1 py-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-primary)] text-lg font-bold text-[color:var(--color-primary-foreground)]"
            title="ChatHub"
          >
            C
          </div>
          {onToggle && (
            <Button
              type="button"
              onClick={onToggle}
              aria-label="Mở sidebar"
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Button
                key={item.label}
                asChild
                title={item.label}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]",
                  isActive && "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                )}
              >
                <Link href={item.href}>
                  {item.icon}
                </Link>
              </Button>
            )
          })}
        </div>
        <div ref={settingsRef} className="relative flex justify-center border-t py-3">
          {settingsOpen && (
            <div className="fixed bottom-14 left-1 z-50 w-52 rounded-md border bg-[color:var(--color-background)] p-1 shadow-md">
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Giao diện • {themeLabel}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
                onClick={() => {
                  setTheme("system")
                  setSettingsOpen(false)
                }}
              >
                <Monitor className="h-4 w-4" />
                Hệ thống
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
                onClick={() => {
                  setTheme("light")
                  setSettingsOpen(false)
                }}
              >
                <Sun className="h-4 w-4" />
                Sáng
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
                onClick={() => {
                  setTheme("dark")
                  setSettingsOpen(false)
                }}
              >
                <Moon className="h-4 w-4" />
                Tối
              </Button>
              <div className="my-1 h-px bg-border" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-[color:var(--color-destructive)] hover:bg-[color:var(--color-muted)]"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          )}

          <Button
            type="button"
            title="Cài đặt"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            onClick={() => setSettingsOpen((v) => !v)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    )
  }

  // Expanded: full sidebar
  return (
    <nav className="flex h-full w-64 min-w-64 flex-col border-r bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-primary)] text-lg font-bold text-[color:var(--color-primary-foreground)]">
            C
          </div>
          <span className="truncate text-lg font-bold">ChatHub</span>
        </div>
        {onToggle && (
          <Button
            type="button"
            onClick={onToggle}
            aria-label="Thu gọn sidebar"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="mb-8 flex-1 space-y-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]",
                isActive && "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
              )}
            >
              <Link href={item.href}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
      <div ref={settingsRef} className="relative border-t px-2 py-3">
        {settingsOpen && (
          <div className="fixed bottom-14 left-1 z-50 w-52 rounded-md border bg-[color:var(--color-background)] p-1 shadow-md">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Giao diện • {themeLabel}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
              onClick={() => {
                setTheme("system")
                setSettingsOpen(false)
              }}
            >
              <Monitor className="h-4 w-4" />
              Hệ thống
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
              onClick={() => {
                setTheme("light")
                setSettingsOpen(false)
              }}
            >
              <Sun className="h-4 w-4" />
              Sáng
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start gap-2 px-2 py-2 hover:bg-[color:var(--color-muted)]"
              onClick={() => {
                setTheme("dark")
                setSettingsOpen(false)
              }}
            >
              <Moon className="h-4 w-4" />
              Tối
            </Button>
            <div className="my-1 h-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start gap-2 px-2 py-2 text-[color:var(--color-destructive)] hover:bg-[color:var(--color-muted)]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-[color:var(--color-muted-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_60%,transparent)] hover:text-[color:var(--color-foreground)]"
          aria-expanded={settingsOpen}
          aria-haspopup="menu"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          <Settings className="h-5 w-5" />
          Cài đặt
        </Button>
      </div>
    </nav>
  )
}
