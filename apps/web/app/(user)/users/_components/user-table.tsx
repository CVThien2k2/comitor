"use client"

import { type UserListItem, users } from "@/api"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { getAvatarColor, getInitials } from "@/lib/helper"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { toast } from "@workspace/ui/components/sonner"
import { useMemo, useState } from "react"

export function UserTable() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const usersQuery = useQuery({
    queryKey: ["users", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      users.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const items = usersQuery.data?.data?.items ?? []
  const meta = usersQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        id: "index",
        enableSorting: false,
        header: () => <div className="text-center">STT</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </div>
        ),
      },
      {
        id: "account",
        enableSorting: false,
        header: "Người dùng",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-10 ring-1 ring-primary/30">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback style={{ backgroundColor: getAvatarColor(user.id), color: "#fff" }}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium text-foreground">{user.name}</p>
                <Badge variant="secondary">@{user.username}</Badge>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        enableSorting: false,
        header: "Email",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
      },
      {
        id: "role",
        enableSorting: false,
        header: "Vai trò / Liên hệ",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="min-w-52 space-y-2">
              <Badge variant="outline">{user.role?.name ?? "Chưa phân vai trò"}</Badge>
              <div className="text-xs text-muted-foreground">
                <p>{user.phone || "Chưa có số điện thoại"}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: "status",
        enableSorting: false,
        header: "Trạng thái",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="min-w-44 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Badge>
                <Badge variant={user.isOnline ? "default" : "outline"}>{user.isOnline ? "Online" : "Offline"}</Badge>
              </div>
              <Badge variant={user.emailVerified ? "outline" : "secondary"}>
                {user.emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
              </Badge>
            </div>
          )
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex justify-end">
              <DataTableRowAction
                onEdit={() => toast.info(`Chỉnh sửa: ${user.name}`)}
                onDelete={() => toast.info(`Xóa: ${user.name}`)}
              />
            </div>
          )
        },
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  )

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách người dùng"
          columns={columns}
          data={items}
          pagination={pagination}
          pageCount={pageCount}
          sorting={sorting}
          globalSearch={globalSearch}
          onGlobalSearchChange={(value) => {
            setGlobalSearch(value)
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          }}
          onSortingChange={(updater: Updater<SortingState>) => {
            setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater))
          }}
          onPaginationChange={(updater: Updater<PaginationState>) => {
            setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater))
          }}
          isLoading={usersQuery.isFetching}
          viewOptions
        />
      </CardContent>
    </Card>
  )
}
