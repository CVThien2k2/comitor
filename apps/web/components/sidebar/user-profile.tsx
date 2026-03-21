"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

function getInitials(name?: string | null) {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const initials = parts.map((p) => p[0]?.toUpperCase()).join("")
  return initials || "U"
}

export function UserProfile({ collapsed }: { collapsed: boolean }) {
  const user = useAuthStore((s) => s.user)

  const name = user?.name ?? "User"
  const isOnline = user?.isOnline ?? false
  const email = user?.email ?? ""

  const dotClassName = cn(
    "absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
    isOnline ? "bg-success" : "bg-muted-foreground/40"
  )

  if (collapsed) {
    return (
      <div className="mt-3 flex justify-center border-t border-sidebar-border pt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="group relative" type="button">
              <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all hover:ring-primary/20">
                <AvatarImage src={user?.avatarUrl ?? ""} />
                <AvatarFallback className="bg-linear-to-br from-indigo-400 to-purple-500 text-xs font-medium text-white">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <span className={dotClassName} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-[11px] text-sidebar-accent-foreground/80 dark:text-sidebar-accent-foreground">
              {email || "—"}
            </span>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-sidebar-border pt-3">
      <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/50">
        <div className="relative">
          <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all group-hover:ring-primary/20">
            <AvatarImage src={user?.avatarUrl ?? ""} />
            <AvatarFallback className="bg-linear-to-br from-indigo-400 to-purple-500 text-xs font-medium text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className={dotClassName} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{name}</p>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className="h-4 max-w-[160px] truncate border-0 bg-linear-to-r from-indigo-400 to-purple-500 px-1.5 text-[10px] font-medium text-white shadow-xs hover:opacity-90"
            >
              {email || "—"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
