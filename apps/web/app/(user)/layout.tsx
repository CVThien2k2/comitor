"use client"

import * as React from "react"
import { AuthWrapper } from "@/components/providers/auth-wrapper"
import { AppHeader } from "@/components/sidebar/app-header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isMobile = useMediaQuery("(max-width: 639px)")
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }, [isMobile])

  const isSidebarOpen = isMobile ? isMobileSidebarOpen : !isDesktopCollapsed

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((value) => !value)
      return
    }

    setIsDesktopCollapsed((value) => !value)
  }

  return (
    <AuthWrapper>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar
          collapsed={isDesktopCollapsed}
          open={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-hidden bg-background transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            !isMobile && (isDesktopCollapsed ? "pl-[68px]" : "pl-[236px]")
          )}
        >
          <AppHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
          <main className="min-h-0 flex-1 overflow-y-scroll">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  )
}
