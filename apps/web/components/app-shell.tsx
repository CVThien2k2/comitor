'use client'

import * as React from 'react'
import { AppSidebar } from './app-sidebar'
import { MobileBottomNav } from './mobile-bottom-nav'
import { cn } from '@workspace/ui/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

type BreakpointMode = 'mobile' | 'tablet' | 'desktop-small' | 'desktop-large'

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [railExpanded, setRailExpanded] = React.useState(false)
  const [breakpoint, setBreakpoint] = React.useState<BreakpointMode>('desktop-large')

  // Detect breakpoint
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) {
        setBreakpoint('mobile')
      } else if (width < 768) {
        setBreakpoint('tablet')
      } else if (width < 1132) {
        setBreakpoint('desktop-small')
      } else {
        setBreakpoint('desktop-large')
      }
    }

    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  // Close mobile menu on breakpoint change
  React.useEffect(() => {
    if (breakpoint !== 'tablet') {
      setMobileMenuOpen(false)
    }
    if (breakpoint !== 'desktop-small') {
      setRailExpanded(false)
    }
  }, [breakpoint])

  const handleNavigation = () => {
    setMobileMenuOpen(false)
    setRailExpanded(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Large: Full Sidebar */}
      {breakpoint === 'desktop-large' && (
        <AppSidebar 
          mode="full"
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)}
          onNavigate={handleNavigation}
        />
      )}

      {/* Desktop Small: Icon Rail + Expandable Overlay */}
      {breakpoint === 'desktop-small' && (
        <>
          {/* Always visible rail */}
          <AppSidebar 
            mode="rail"
            onExpand={() => setRailExpanded(true)}
            onNavigate={handleNavigation}
          />
          
          {/* Expanded overlay */}
          {railExpanded && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
                onClick={() => setRailExpanded(false)}
              />
              <div className="fixed left-16 top-0 h-screen z-40">
                <AppSidebar 
                  mode="overlay"
                  onClose={() => setRailExpanded(false)}
                  onNavigate={handleNavigation}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Tablet: Off-canvas Overlay */}
      {breakpoint === 'tablet' && (
        <>
          {mobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed left-0 top-0 h-screen z-50">
                <AppSidebar 
                  mode="overlay"
                  onClose={() => setMobileMenuOpen(false)}
                  onNavigate={handleNavigation}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-hidden bg-muted/30 transition-all duration-300',
        breakpoint === 'mobile' && 'pb-16'
      )}>
        {/* Tablet hamburger header */}
        {breakpoint === 'tablet' && (
          <TabletHeader onMenuOpen={() => setMobileMenuOpen(true)} />
        )}
        {children}
      </main>

      {/* Mobile: Bottom Navigation */}
      {breakpoint === 'mobile' && (
        <MobileBottomNav />
      )}
    </div>
  )
}

function TabletHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="flex items-center h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm">
      <button
        onClick={onMenuOpen}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
      >
        <svg 
          className="w-5 h-5 text-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="ml-3 flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground font-semibold text-xs">
          CH
        </div>
        <span className="font-semibold text-sm text-foreground">Elines OS</span>
      </div>
    </div>
  )
}
