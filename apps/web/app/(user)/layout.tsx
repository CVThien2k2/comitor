"use client"

import * as React from "react"
import { AuthWrapper } from "@/components/providers/auth-wrapper"
import { AppHeader } from "@/components/sidebar/app-header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isMobile = useMediaQuery("(max-width: 639px)")
  const pathname = usePathname()
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }, [isMobile])

  const isSidebarOpen = isMobile ? isMobileSidebarOpen : !isDesktopCollapsed
  const isConversationDetailRoute = pathname?.startsWith("/conversations/")
  const shouldHideAppHeader = isMobile && isConversationDetailRoute

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((value) => !value)
      return
    }

    setIsDesktopCollapsed((value) => !value)
  }

  return (
    <AuthWrapper>
      <div className="fixed inset-0 flex overflow-hidden bg-background">
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
          {!shouldHideAppHeader && <AppHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />}
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  )
}
