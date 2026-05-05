"use client"

import { type UserListItem, users } from "@/api"
import { ConfirmDialog } from "@/components/global/confirm-dialog"
import { Icons } from "@/components/global/icons"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { getAvatarColor, getInitials } from "@/lib/helper"
import { UserCreateDialogForm } from "./user-create-dialog-form"
import { UserEditDialogForm } from "./user-edit-dialog-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { toast } from "@workspace/ui/components/sonner"
import { useMemo, useState } from "react"

export function UserTable() {
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null)
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

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => users.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa người dùng thành công")
      void queryClient.invalidateQueries({ queryKey: ["users", "list"] })
      setDeleteTarget(null)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể xóa người dùng.")
    },
  })

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
        header: "Vai trò / Cấp độ",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="min-w-52 space-y-2">
              {user.role?.name ? (
                <Badge variant="outline" className="w-fit tracking-wide uppercase">
                  {user.role.name}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa phân vai trò</p>
              )}

              {user.agentLevel?.code ? (
                <Badge variant="secondary" className="w-fit tracking-wide uppercase">
                  {user.agentLevel.code}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa phân cấp độ</p>
              )}
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
                onEdit={() => {
                  setEditingUser(user)
                  setIsEditOpen(true)
                }}
                onDelete={() => setDeleteTarget(user)}
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
          description="Theo dõi tài khoản nội bộ, vai trò và trạng thái hoạt động của từng người dùng."
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
          toolbarRight={
            <Button type="button" className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Icons.plus className="size-4" />
              Thêm mới
            </Button>
          }
          isLoading={usersQuery.isFetching}
          viewOptions
        />

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tạo người dùng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin tài khoản. Vai trò và cấp độ nhân viên được tải khi mở từng select.
              </DialogDescription>
            </DialogHeader>

            <UserCreateDialogForm
              open={isCreateOpen}
              onCancel={() => setIsCreateOpen(false)}
              onCreated={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) {
              setEditingUser(null)
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin tài khoản, vai trò, cấp độ nhân viên và trạng thái hoạt động.
              </DialogDescription>
            </DialogHeader>

            <UserEditDialogForm
              open={isEditOpen}
              user={editingUser}
              onCancel={() => setIsEditOpen(false)}
              onUpdated={() => setIsEditOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xóa người dùng"
          message={`Người dùng sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?`}
          confirmText="Xóa"
          variant="danger"
          isLoading={deleteUserMutation.isPending}
          loadingText="Đang xóa người dùng"
          onConfirm={() => {
            if (!deleteTarget) return
            deleteUserMutation.mutate(deleteTarget.id)
          }}
        />
      </CardContent>
    </Card>
  )
}
