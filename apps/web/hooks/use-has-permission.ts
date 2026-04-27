"use client"

import { useMemo } from "react"
import type { PermissionCode } from "@workspace/database"
import { useAuthStore } from "@/stores/auth-store"

export function useHasPermission(permission: PermissionCode) {
  const permissions = useAuthStore((state) => state.permissions)

  return useMemo(() => {
    const permissionSet = new Set<string>(permissions)
    const group = permission.split(":")[0]

    return permissionSet.has(permission) || permissionSet.has("*") || permissionSet.has(`${group}:*`)
  }, [permission, permissions])
}
