"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { conversations as conversationsApi } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { getBreadcrumbItems } from "@/lib/app-navigation"
import { getConversationDisplayName } from "@/lib/helper"
import { useChatStore } from "@/stores/chat-store"

interface AppHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppHeader({ isSidebarOpen, onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname()
  const isOpen = isSidebarOpen
  const Icon = isOpen ? Icons.panelLeftClose : Icons.panelLeft
  const conversationId = React.useMemo(() => {
    const match = pathname.match(/^\/conversations\/([^/]+)$/)
    return match?.[1] ?? null
  }, [pathname])
  const conversationFromStore = useChatStore((s) =>
    conversationId ? s.conversations.find((conversation) => conversation.id === conversationId) ?? null : null
  )
  const { data: conversationResponse } = useQuery({
    queryKey: ["conversations", "detail", conversationId],
    queryFn: () => conversationsApi.getById(conversationId!),
    enabled: !!conversationId && !conversationFromStore,
  })
  const conversation = conversationFromStore ?? conversationResponse?.data ?? null
  const breadcrumbItems = React.useMemo(() => {
    const items = getBreadcrumbItems(pathname)
    if (!conversationId || !conversation) return items

    const displayName = getConversationDisplayName(conversation)
    const lastIndex = items.length - 1
    if (lastIndex < 0) return items

    return items.map((item, index) => (index === lastIndex ? { ...item, label: displayName } : item))
  }, [conversation, conversationId, pathname])

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

      <div className="ml-auto shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Thông báo"
              className="text-muted-foreground hover:text-foreground"
            >
              <Icons.bell className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3">
            <DropdownMenuLabel className="px-0 pb-1">Thông báo</DropdownMenuLabel>
            <p className="text-sm text-muted-foreground">Chưa có thông báo</p>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
