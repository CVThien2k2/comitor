'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@workspace/ui/lib/utils'
import { Icons } from '@/components/global/icons'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: number
}

const mainNavItems: NavItem[] = [
  { label: 'Hội thoại', icon: Icons.inbox, href: '/', badge: 12 },
  { label: 'Kênh kết nối', icon: Icons.radio, href: '/accounts' },
//   { label: 'Công việc', icon: Icons.checkSquare, href: '/tasks' },
//   { label: 'Tổ chức', icon: Icons.building2, href: '/organizations' },
//   { label: 'Khách hàng', icon: Icons.users, href: '/customers' },
//   { label: 'Tri thức', icon: Icons.bookOpen, href: '/knowledge' },
//   { label: 'Nội dung', icon: Icons.fileText, href: '/content' },
//   { label: 'Tự động hóa', icon: Icons.workflow, href: '/automation' },
//   { label: 'AI Agents', icon: Icons.bot, href: '/agents' },
//   { label: 'Phân tích', icon: Icons.barChart3, href: '/analytics' },
]

const bottomNavItems: NavItem[] = [
  { label: 'Cài đặt', icon: Icons.settings, href: '/settings' },
]

type SidebarMode = 'full' | 'rail' | 'overlay'

interface AppSidebarProps {
  mode?: SidebarMode
  collapsed?: boolean
  onToggle?: () => void
  onExpand?: () => void
  onClose?: () => void
  onNavigate?: () => void
}

export function AppSidebar({ 
  mode = 'full',
  collapsed = false, 
  onToggle,
  onExpand,
  onClose,
  onNavigate 
}: AppSidebarProps) {
  const pathname = usePathname()

  // Determine if we should show collapsed view
  const isCollapsed = mode === 'rail' || (mode === 'full' && collapsed)
  const showLabels = mode === 'overlay' || (mode === 'full' && !collapsed)

  const handleLinkClick = () => {
    onNavigate?.()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          mode === 'rail' && 'w-16',
          mode === 'overlay' && 'w-[220px] shadow-2xl',
          mode === 'full' && (collapsed ? 'w-[68px]' : 'w-[220px]')
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          isCollapsed && !showLabels ? 'justify-center' : 'gap-3'
        )}>
          {/* Rail expand button */}
          {mode === 'rail' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onExpand}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shrink-0 hover:bg-primary/90 transition-colors"
                >
                  CH
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Mở rộng menu
              </TooltipContent>
            </Tooltip>
          )}

          {/* Overlay close button + logo */}
          {mode === 'overlay' && (
            <>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Icons.x className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
                  CH
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sidebar-foreground text-sm tracking-tight">
                    Elines OS
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Knowledge System
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Full mode logo */}
          {mode === 'full' && (
            <>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                CH
              </div>
              <div className={cn(
                'flex flex-col overflow-hidden transition-all duration-300',
                collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}>
                <span className="font-semibold text-sidebar-foreground text-sm tracking-tight">
                  Elines OS
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Knowledge System
                </span>
              </div>
            </>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                collapsed={isCollapsed && !showLabels}
                onClick={handleLinkClick}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          {/* Theme Toggle */}
          <div className="mb-2">
            <ThemeToggle collapsed={isCollapsed && !showLabels} />
          </div>

          {/* Settings */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
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
        {mode === 'full' && (
          <div className="px-3 py-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={cn(
                'w-full justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                !collapsed && 'justify-between'
              )}
            >
              {!collapsed && (
                <span className="text-xs">Thu gọn</span>
              )}
              {collapsed ? (
                <Icons.chevronRight className="w-4 h-4" />
              ) : (
                <Icons.chevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}

interface NavLinkProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavLink({ item, isActive, collapsed, onClick }: NavLinkProps) {
  const Icon = item.icon

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:bg-sidebar-accent/70',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
          : 'text-muted-foreground hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <div className="relative">
        <Icon className={cn(
          'w-[18px] h-[18px] shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
        )} />
        {collapsed && item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
      
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <Badge 
              className="h-5 min-w-5 px-1.5 text-[10px] font-semibold bg-primary text-primary-foreground"
            >
              {item.badge > 99 ? '99+' : item.badge}
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
          <div className="relative">
            {linkContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && item.badge > 0 && (
            <Badge className="h-4 px-1.5 text-[10px] bg-primary text-primary-foreground">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

function UserProfile({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="mt-3 pt-3 border-t border-sidebar-border flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="relative group">
              <Avatar className="w-9 h-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-medium">
                  NT
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col">
            <span className="font-medium">Nguyễn Đức Thành</span>
            <span className="text-muted-foreground text-[11px]">Admin</span>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-sidebar-border">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group">
        <div className="relative">
          <Avatar className="w-9 h-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-medium">
              NT
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            Nguyễn Đức Thành
          </p>
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="secondary" 
              className="h-4 px-1.5 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/10"
            >
              Admin
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
