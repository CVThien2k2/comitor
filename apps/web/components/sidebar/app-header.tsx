"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "@/components/global/icons"
import { getBreadcrumbItems } from "@/lib/app-navigation"

interface AppHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppHeader({ isSidebarOpen, onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname()
  const isOpen = isSidebarOpen
  const Icon = isOpen ? Icons.panelLeftClose : Icons.panelLeft
  const breadcrumbItems = getBreadcrumbItems(pathname)

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        aria-pressed={isOpen}
        className="text-muted-foreground transition-[transform,color] duration-300 hover:text-foreground"
      >
        <Icon className="size-4" />
      </Button>

      <div className="h-4 w-px shrink-0 bg-border" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="min-w-0 flex-nowrap">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <React.Fragment key={item.href ?? `${item.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className="min-w-0">
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="truncate">
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
