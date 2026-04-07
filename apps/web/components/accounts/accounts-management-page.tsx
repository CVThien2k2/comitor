"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { type UserListItem, roles, users } from "@/api"
import { Icons } from "@/components/global/icons"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import DataTable from "@/components/table/data-table"
import { useAuthStore } from "@/stores/auth-store"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import type { UserProfile } from "@workspace/shared"
import { AccountFormDialog } from "./account-form-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"

type FormDialogState = {
  open: boolean
  mode: "create" | "edit"
  account: UserListItem | null
}

const INITIAL_FORM_DIALOG_STATE: FormDialogState = {
  open: false,
  mode: "create",
  account: null,
}

function getInitials(name: string) {
  const normalized = name.trim()

  if (!normalized) return "TK"

  const parts = normalized.split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AccountsManagementPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [formDialog, setFormDialog] = useState<FormDialogState>(INITIAL_FORM_DIALOG_STATE)
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null)

  const accountsQuery = useQuery({
    queryKey: ["accounts", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      users.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const rolesQuery = useQuery({
    queryKey: ["roles", "accounts-form"],
    queryFn: () => roles.getAll({ page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => users.delete(id),
    onSuccess: (response) => {
      const shouldBackToPreviousPage = pagination.pageIndex > 0 && (accountsQuery.data?.data?.items.length ?? 0) <= 1

      if (shouldBackToPreviousPage) {
        setPagination((current) => ({
          ...current,
          pageIndex: current.pageIndex - 1,
        }))
      }

      toast.success(response.message)
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể xóa tài khoản. Vui lòng thử lại.")
    },
  })

  const roleOptions = rolesQuery.data?.data?.items ?? []
  const accounts = accountsQuery.data?.data?.items ?? []
  const meta = accountsQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const stats = [
    {
      title: "Tổng tài khoản",
      value: meta?.total ?? 0,
      description: "Số lượng bản ghi trong bảng user.",
      icon: Icons.users,
    },
    {
      title: "Đang hiển thị",
      value: accounts.length,
      description: "Số tài khoản ở trang dữ liệu hiện tại.",
      icon: Icons.inbox,
    },
    {
      title: "Đang hoạt động",
      value: accounts.filter((account) => account.isActive).length,
      description: "Thống kê trên tập kết quả đang xem.",
      icon: Icons.checkCircle2,
    },
    {
      title: "Đang online",
      value: accounts.filter((account) => account.isOnline).length,
      description: "Tín hiệu phiên làm việc ở trang hiện tại.",
      icon: Icons.sparkles,
    },
  ]

  const handleFormSuccess = (user: UserProfile | null) => {
    if (user && user.id === currentUser?.id) {
      useAuthStore.getState().setUser(user)
    }

    void queryClient.invalidateQueries({ queryKey: ["accounts"] })
  }

  const columns: ColumnDef<UserListItem>[] = [
    {
      id: "account",
      header: "Tài khoản",
      cell: ({ row }) => {
        const account = row.original

        return (
          <div className="flex min-w-[18rem] items-center gap-3">
            <Avatar className="size-10">
              {account.avatarUrl ? <AvatarImage src={account.avatarUrl} alt={account.name} /> : null}
              <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-foreground">{account.name}</p>
                <Badge variant="secondary">@{account.username}</Badge>
                {account.role?.name ? <Badge variant="outline">{account.role.name}</Badge> : null}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="truncate">{account.email}</p>
                <p>{account.phone || "Chưa cập nhật số điện thoại"}</p>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const account = row.original
        const isCurrentUser = account.id === currentUser?.id

        return (
          <div className="min-w-[13rem] space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={account.isActive ? "default" : "secondary"}>
                {account.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
              </Badge>
              <Badge variant={account.isOnline ? "default" : "outline"}>
                {account.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={account.emailVerified ? "outline" : "secondary"}>
                {account.emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
              </Badge>
              {isCurrentUser ? <Badge variant="secondary">Bạn</Badge> : null}
            </div>
          </div>
        )
      },
    },
    {
      id: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => {
        const account = row.original

        return (
          <div className="min-w-[12rem] space-y-1 text-sm">
            <p className="font-medium text-foreground">{formatDateTime(account.updatedAt)}</p>
            <p className="text-muted-foreground">Tạo lúc: {formatDateTime(account.createdAt)}</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        const account = row.original
        const isCurrentUser = account.id === currentUser?.id

        return (
          <div className="flex justify-end">
            <DataTableRowAction
              onEdit={() =>
                setFormDialog({
                  open: true,
                  mode: "edit",
                  account,
                })
              }
              onDelete={isCurrentUser ? undefined : () => setDeleteTarget(account)}
            />
          </div>
        )
      },
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Quản lý tài khoản</h1>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Theo dõi danh sách tài khoản nội bộ, cập nhật vai trò và trạng thái hoạt động
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => accountsQuery.refetch()}
                disabled={accountsQuery.isFetching}
              >
                {accountsQuery.isFetching ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : (
                  <Icons.refreshCw className="size-4" />
                )}
                Tải lại
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setFormDialog({
                    open: true,
                    mode: "create",
                    account: null,
                  })
                }
              >
                <Icons.plus className="size-4" />
                Thêm tài khoản
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title} className="border border-border/70 bg-card/70">
                  <CardHeader className="pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardDescription>{item.title}</CardDescription>
                        <CardTitle className="mt-2 text-3xl font-semibold">{item.value}</CardTitle>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-2 text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">{item.description}</CardContent>
                </Card>
              )
            })}
        </section>

        {rolesQuery.isError ? (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader>
              <CardTitle className="text-base">Không tải được danh sách vai trò</CardTitle>
              <CardDescription>
                {(rolesQuery.error as { message?: string })?.message ??
                  "Form vẫn mở được, nhưng bạn sẽ không thể chọn vai trò mới cho tài khoản."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Card className="border border-border/70 bg-card/70">
          <CardHeader className="gap-2 border-b border-border/60">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle>Danh sách tài khoản nội bộ</CardTitle>
                <CardDescription>Tìm kiếm theo tên, email, username hoặc số điện thoại.</CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{meta?.total ?? 0} bản ghi</Badge>
                <span>Trang {meta?.page ?? pagination.pageIndex + 1}</span>
                <span>/</span>
                <span>{meta?.totalPages ?? 1} trang</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {accountsQuery.isError ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
                <Icons.alertCircle className="mb-3 size-10 text-destructive" />
                <p className="text-sm font-semibold text-foreground">Không thể tải danh sách tài khoản</p>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {(accountsQuery.error as { message?: string })?.message ?? "Vui lòng thử lại sau ít phút."}
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={() => accountsQuery.refetch()}>
                  <Icons.refreshCw className="size-4" />
                  Thử lại
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={accounts}
                pagination={pagination}
                pageCount={pageCount}
                sorting={sorting}
                globalSearch={globalSearch}
                onSortingChange={setSorting}
                onPaginationChange={setPagination}
                onGlobalSearchChange={(value) => {
                  setGlobalSearch(value)
                  setPagination((current) => ({
                    ...current,
                    pageIndex: 0,
                  }))
                }}
                isLoading={accountsQuery.isLoading || accountsQuery.isFetching}
                viewOptions={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AccountFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        account={formDialog.account}
        roles={roleOptions}
        rolesError={
          rolesQuery.isError
            ? ((rolesQuery.error as { message?: string })?.message ?? "Không thể tải danh sách vai trò.")
            : undefined
        }
        onOpenChange={(open) => {
          setFormDialog((current) =>
            open
              ? current
              : {
                  ...INITIAL_FORM_DIALOG_STATE,
                  open: false,
                }
          )
        }}
        onSuccess={handleFormSuccess}
      />

      <DeleteAccountDialog
        open={!!deleteTarget}
        account={deleteTarget}
        isPending={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </div>
  )
}
