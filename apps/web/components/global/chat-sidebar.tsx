"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Inbox,
  Radio,
  CheckSquare,
  Building2,
  Users,
  Zap,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"

interface ChatSidebarProps {
  onToggle?: () => void
  isOpen?: boolean
}

interface NavItem {
  icon: React.ReactNode
  label: string
  active?: boolean
}

const navItems: NavItem[] = [
  { icon: <Inbox className="h-5 w-5 shrink-0" />, label: "Hộp thư đến", active: true },
  { icon: <Radio className="h-5 w-5 shrink-0" />, label: "Kênh", active: false },
  { icon: <CheckSquare className="h-5 w-5 shrink-0" />, label: "Công việc", active: false },
  { icon: <Building2 className="h-5 w-5 shrink-0" />, label: "Tổ chức", active: false },
  { icon: <Users className="h-5 w-5 shrink-0" />, label: "Khách hàng", active: false },
  { icon: <Zap className="h-5 w-5 shrink-0" />, label: "Tự động hóa", active: false },
  { icon: <BarChart3 className="h-5 w-5 shrink-0" />, label: "Phân tích", active: false },
]

export function ChatSidebar({ onToggle, isOpen = true }: ChatSidebarProps) {
  const isCollapsed = !isOpen

  // Collapsed: icon-only bar
  if (isCollapsed) {
    return (
      <nav className="flex h-full w-12 min-w-12 shrink-0 flex-col border-r bg-background">
        <div className="flex shrink-0 flex-col items-center gap-1 py-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white"
            title="ChatHub"
          >
            C
          </div>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Mở sidebar"
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.label}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                item.active
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="flex justify-center border-t pt-2 pb-2">
          <button
            type="button"
            title="Cài đặt"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </nav>
    )
  }

  // Expanded: full sidebar
  return (
    <nav className="flex h-full w-64 min-w-64 flex-col border-r bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
            C
          </div>
          <span className="truncate text-lg font-bold">ChatHub</span>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Thu gọn sidebar"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="mb-8 flex-1 space-y-2 px-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 px-3",
              item.active ? "bg-indigo-600 text-white" : "text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
      <div className="border-t pt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3">
          <Settings className="h-5 w-5" />
          Cài đặt
        </Button>
      </div>
    </nav>
  )
}
