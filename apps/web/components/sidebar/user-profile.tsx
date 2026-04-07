"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { auth } from "@/api/auth"
import { Icons } from "@/components/global/icons"
import { AUTH_POST_LOGOUT_TOAST_KEY } from "@/lib/constants/auth"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"

function getInitials(name?: string | null) {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const initials = parts.map((p) => p[0]?.toUpperCase()).join("")
  return initials || "U"
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message

    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ")
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Không thể kết nối đến server. Vui lòng thử lại."
}

export function UserProfile({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.logout)
  const resetApp = useAppStore((s) => s.reset)

  const name = user?.name ?? "User"
  const isOnline = user?.isOnline ?? false
  const email = user?.email ?? ""

  const dotClassName = cn(
    "absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
    isOnline ? "bg-success" : "bg-muted-foreground/40"
  )

  const logoutMutation = useMutation({
    mutationFn: auth.logout,
    onSuccess: (res) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_POST_LOGOUT_TOAST_KEY, res.message || "Đăng xuất thành công")
      }

      queryClient.clear()
      clearAuth()
      resetApp()
      router.replace("/login")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { position: "bottom-right" })
    },
  })

  const profileTrigger = collapsed ? (
    <button
      type="button"
      disabled={logoutMutation.isPending}
      className="group relative rounded-lg outline-hidden transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-70"
    >
      <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all">
        <AvatarImage src={user?.avatarUrl ?? ""} />
        <AvatarFallback className="bg-linear-to-br from-indigo-400 to-purple-500 text-xs font-medium text-white">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className={dotClassName} />
    </button>
  ) : (
    <button
      type="button"
      disabled={logoutMutation.isPending}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent/50 focus-visible:bg-sidebar-accent/50 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-70"
    >
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
      <Icons.chevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  )

  return (
    <div className={cn("mt-3 border-t border-sidebar-border pt-3", collapsed && "flex justify-center")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{profileTrigger}</DropdownMenuTrigger>
        <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "center" : "end"}>
          <DropdownMenuItem
            variant="destructive"
            disabled={logoutMutation.isPending}
            onSelect={() => logoutMutation.mutate()}
          >
            {logoutMutation.isPending ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.logOut className="h-4 w-4" />
            )}
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
