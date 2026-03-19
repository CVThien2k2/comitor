'use client'

import * as React from 'react'
import { Icons } from '@/components/global/icons'
import { useTheme } from 'next-themes'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'

interface ThemeToggleProps {
  collapsed?: boolean
  className?: string
}

export function ThemeToggle({ collapsed = false, className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
          collapsed ? 'w-9 h-9 p-0' : 'w-full justify-start gap-3 px-3',
          className
        )}
        disabled
      >
        <div className="w-[18px] h-[18px]" />
        {!collapsed && <span className="text-sm">Đang tải...</span>}
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const button = (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors',
        collapsed ? 'w-9 h-9 p-0' : 'w-full justify-start gap-3 px-3',
        className
      )}
    >
      <div className="relative w-[18px] h-[18px]">
        <Icons.sun className={cn(
          'absolute inset-0 h-[18px] w-[18px] transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )} />
        <Icons.moon className={cn(
          'absolute inset-0 h-[18px] w-[18px] transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )} />
      </div>
      {!collapsed && (
        <span className="text-sm font-medium">
          {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        </span>
      )}
    </Button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right">
          {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}
