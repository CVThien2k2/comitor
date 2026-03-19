'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@workspace/ui/lib/utils'
import { Icons } from '@/components/global/icons'
import { Badge } from '@workspace/ui/components/badge'
import { useTheme } from 'next-themes'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: number
}

const primaryNavItems: NavItem[] = [
  { label: 'Hộp thư', icon: Icons.inbox, href: '/', badge: 12 },
  { label: 'Khách hàng', icon: Icons.users, href: '/customers' },
  { label: 'Công việc', icon: Icons.checkSquare, href: '/tasks' },
  { label: 'Phân tích', icon: Icons.barChart3, href: '/analytics' },
]

const moreNavItems: NavItem[] = [
  { label: 'Kênh kết nối', icon: Icons.radio, href: '/channels' },
  { label: 'Tổ chức', icon: Icons.building2, href: '/organizations' },
  { label: 'Tri thức', icon: Icons.bookOpen, href: '/knowledge' },
  { label: 'Nội dung', icon: Icons.fileText, href: '/content' },
  { label: 'Tự động hóa', icon: Icons.workflow, href: '/automation' },
  { label: 'AI Agents', icon: Icons.bot, href: '/agents' },
  { label: 'Cài đặt', icon: Icons.settings, href: '/settings' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isMoreActive = moreNavItems.some(item => 
    pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => (
            <BottomNavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ))}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-lg transition-colors',
              isMoreActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <Icons.moreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Thêm</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setSheetOpen(false)}
          />
          
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Menu</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icons.x className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="px-3 py-4 space-y-1 max-h-[60vh] overflow-y-auto">
              {moreNavItems.map((item) => (
                <SheetNavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  onClick={() => setSheetOpen(false)}
                />
              ))}

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="relative w-6 h-6">
                    <Icons.sun className={cn(
                      'absolute inset-0 w-6 h-6 transition-all duration-300',
                      resolvedTheme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    )} />
                    <Icons.moon className={cn(
                      'absolute inset-0 w-6 h-6 transition-all duration-300',
                      resolvedTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    )} />
                  </div>
                  <span className="text-sm font-medium">
                    {resolvedTheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                  </span>
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

function BottomNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-lg transition-colors',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  )
}

function SheetNavItem({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavItem
  isActive: boolean
  onClick: () => void 
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge className="ml-auto h-5 px-2 text-[10px] bg-primary text-primary-foreground">
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}
