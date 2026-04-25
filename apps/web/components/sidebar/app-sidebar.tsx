"use client"

import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { SidebarContent } from "./sidebar-content"

interface AppSidebarProps {
  collapsed: boolean
  open: boolean
  onClose: () => void
}

export function AppSidebar({ collapsed, open, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-[min(18rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent pathname={pathname} collapsed={false} onNavigate={onClose} />
      </aside>

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 hidden h-screen flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex",
          collapsed ? "w-[68px]" : "w-[236px]"
        )}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />
      </aside>
    </TooltipProvider>
  )
}
