"use client"

import * as React from "react"
import { AppSidebar } from "./app-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { cn } from "@workspace/ui/lib/utils"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"

interface AppShellProps {
  children: React.ReactNode
}

type BreakpointMode = "mobile" | "tablet" | "desktop-small" | "desktop-large"

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [railExpanded, setRailExpanded] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 639px)")
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 767px)")
  const isDesktopSmall = useMediaQuery("(min-width: 768px) and (max-width: 1131px)")

  const breakpoint: BreakpointMode = React.useMemo(() => {
    if (isMobile) return "mobile"
    if (isTablet) return "tablet"
    if (isDesktopSmall) return "desktop-small"
    return "desktop-large"
  }, [isDesktopSmall, isMobile, isTablet])

  // Close mobile menu on breakpoint change
  React.useEffect(() => {
    if (breakpoint !== "tablet") {
      setMobileMenuOpen(false)
    }
    if (breakpoint !== "desktop-small") {
      setRailExpanded(false)
    }
  }, [breakpoint])

  const handleNavigation = () => {
    setMobileMenuOpen(false)
    setRailExpanded(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Large: Full Sidebar */}
      {breakpoint === "desktop-large" && (
        <AppSidebar
          mode="full"
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onNavigate={handleNavigation}
        />
      )}

      {/* Desktop Small: Icon Rail + Expandable Overlay */}
      {breakpoint === "desktop-small" && (
        <>
          {/* Always visible rail */}
          <AppSidebar mode="rail" onExpand={() => setRailExpanded(true)} onNavigate={handleNavigation} />

          {/* Expanded overlay */}
          {railExpanded && (
            <>
              <div
                className="fixed inset-0 z-30 bg-foreground/20 transition-opacity duration-200"
                onClick={() => setRailExpanded(false)}
              />
              <div className="fixed top-0 left-16 z-40 h-screen">
                <AppSidebar mode="overlay" onClose={() => setRailExpanded(false)} onNavigate={handleNavigation} />
              </div>
            </>
          )}
        </>
      )}

      {/* Tablet: Off-canvas Overlay */}
      {breakpoint === "tablet" && (
        <>
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-200"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed top-0 left-0 z-50 h-screen">
                <AppSidebar mode="overlay" onClose={() => setMobileMenuOpen(false)} onNavigate={handleNavigation} />
              </div>
            </>
          )}
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-hidden bg-background transition-[padding] duration-200",
          breakpoint === "mobile" && "pb-16"
        )}
      >
        {/* Tablet hamburger header */}
        {breakpoint === "tablet" && <TabletHeader onMenuOpen={() => setMobileMenuOpen(true)} />}
        {children}
      </main>

      {/* Mobile: Bottom Navigation */}
      {breakpoint === "mobile" && <MobileBottomNav />}
    </div>
  )
}

function TabletHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <button
        onClick={onMenuOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted"
      >
        <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="ml-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
          CH
        </div>
        <span className="text-sm font-semibold text-foreground">Elines OS</span>
      </div>
    </div>
  )
}
