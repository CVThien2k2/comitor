'use client'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { Inbox, Radio, CheckSquare, Building2, Users, Zap, BarChart3, Settings, PanelLeftClose, PanelLeft } from 'lucide-react'

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
  { icon: <Inbox className="w-5 h-5 shrink-0" />, label: 'Hộp thư đến', active: true },
  { icon: <Radio className="w-5 h-5 shrink-0" />, label: 'Kênh', active: false },
  { icon: <CheckSquare className="w-5 h-5 shrink-0" />, label: 'Công việc', active: false },
  { icon: <Building2 className="w-5 h-5 shrink-0" />, label: 'Tổ chức', active: false },
  { icon: <Users className="w-5 h-5 shrink-0" />, label: 'Khách hàng', active: false },
  { icon: <Zap className="w-5 h-5 shrink-0" />, label: 'Tự động hóa', active: false },
  { icon: <BarChart3 className="w-5 h-5 shrink-0" />, label: 'Phân tích', active: false },
]

export function ChatSidebar({ onToggle, isOpen = true }: ChatSidebarProps) {
  const isCollapsed = !isOpen

  // Collapsed: icon-only bar
  if (isCollapsed) {
    return (
      <nav className="w-12 min-w-12 border-r bg-background flex flex-col h-full flex-shrink-0">
        <div className="flex flex-col items-center py-3 gap-1 flex-shrink-0">
          <div
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
            title="ChatHub"
          >
            C
          </div>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Mở sidebar"
              className="p-0.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground shrink-0"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center py-2 gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.label}
              className={cn(
                'w-8 h-8 rounded flex items-center justify-center shrink-0',
                item.active ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="border-t pt-2 pb-2 flex justify-center">
          <button
            type="button"
            title="Cài đặt"
            className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>
    )
  }

  // Expanded: full sidebar
  return (
    <nav className="w-64 min-w-64 border-r bg-background flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            C
          </div>
          <span className="font-bold text-lg truncate">ChatHub</span>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Thu gọn sidebar"
            className="p-0.5 rounded hover:bg-muted/60 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-2 px-2 mb-8">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 px-3',
              item.active ? 'bg-indigo-600 text-white' : 'text-foreground'
            )}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
      <div className="border-t pt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3">
          <Settings className="w-5 h-5" />
          Cài đặt
        </Button>
      </div>
    </nav>
  )
}
