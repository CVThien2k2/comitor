"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"

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
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="default"
        className={cn(
          "text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          collapsed
            ? "h-auto w-full justify-center gap-0 px-2 py-2.5"
            : "h-auto w-full justify-start gap-3 px-3 py-2.5",
          className
        )}
        disabled
      >
        <div className="h-[18px] w-[18px]" />
        {!collapsed && <span className="text-sm">Đang tải...</span>}
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  const button = (
    <Button
      variant="ghost"
      size="default"
      onClick={toggleTheme}
      className={cn(
        "text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        collapsed ? "h-auto w-full justify-center gap-0 px-2 py-2.5" : "h-auto w-full justify-start gap-3 px-3 py-2.5",
        className
      )}
    >
      <div className="relative h-[18px] w-[18px]">
        <Icons.sun
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-300",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
        />
        <Icons.moon
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )}
        />
      </div>
      {!collapsed && <span className="text-sm font-medium">{isDark ? "Chế độ sáng" : "Chế độ tối"}</span>}
    </Button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{isDark ? "Chế độ sáng" : "Chế độ tối"}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
