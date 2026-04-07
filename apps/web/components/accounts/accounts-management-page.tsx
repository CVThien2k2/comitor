"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { type UserListItem, roles, users } from "@/api"
import { ConfirmDialog } from "@/components/global/confirm-dialog"
import { Icons } from "@/components/global/icons"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import DataTable from "@/components/table/data-table"
import { useAuthStore } from "@/stores/auth-store"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import type { UserProfile } from "@workspace/shared"
import { AccountFormDialog } from "./account-form-dialog"

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
  const currentPage = meta?.page ?? pagination.pageIndex + 1
  const activeAccounts = accounts.filter((account) => account.isActive).length
  const onlineAccounts = accounts.filter((account) => account.isOnline).length
  const verifiedAccounts = accounts.filter((account) => account.emailVerified).length

  const summaryStats = [
    {
      title: "Tổng tài khoản",
      value: meta?.total ?? 0,
      caption: "trong hệ thống",
      icon: Icons.users,
      iconWrapperClassName: "bg-primary/10 dark:bg-primary/20",
      iconClassName: "text-primary dark:text-primary/90",
    },
    {
      title: "Đang hoạt động",
      value: activeAccounts,
      caption: "trên tập đang xem",
      icon: Icons.checkCircle2,
      iconWrapperClassName: "bg-blue-100 dark:bg-blue-900/50",
      iconClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Email đã xác minh",
      value: verifiedAccounts,
      caption: `${onlineAccounts} tài khoản đang online`,
      icon: Icons.sparkles,
      iconWrapperClassName: "bg-amber-100 dark:bg-amber-900/50",
      iconClassName: "text-amber-600 dark:text-amber-400",
    },
  ] as const

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
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-4 border-b border-border/50 bg-card/50 px-4 py-5 md:h-[64px] md:flex-row md:items-center md:justify-between md:gap-0 md:px-8 md:py-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground dark:text-zinc-100">Quản lý tài khoản</h1>
          <p className="mt-0.5 text-sm text-muted-foreground dark:text-zinc-500">
            Theo dõi người dùng nội bộ, vai trò và trạng thái hoạt động trong hệ thống.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 bg-background/80 shadow-sm hover:bg-background md:w-auto dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
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
            className="w-full gap-2 bg-primary shadow-sm hover:bg-primary/90 md:w-auto dark:bg-primary/90 dark:hover:bg-primary/80"
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
      </header>

      <div className="flex-1 overflow-y-auto bg-background dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <section className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-4 md:grid-cols-2 md:gap-4 md:p-5 xl:grid-cols-3 dark:border-primary/20 dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
            {summaryStats.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconWrapperClassName}`}
                  >
                    <Icon className={`h-5 w-5 ${item.iconClassName}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground dark:text-zinc-100">
                      {item.value.toLocaleString("vi-VN")}
                    </p>
                    <p className="text-sm font-medium text-foreground/90 dark:text-zinc-200">{item.title}</p>
                    <p className="text-sm text-muted-foreground dark:text-zinc-500">{item.caption}</p>
                  </div>
                </div>
              )
            })}
          </section>

          {rolesQuery.isError ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                  <Icons.alertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Không tải được danh sách vai trò
                  </p>
                  <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-100/80">
                    {(rolesQuery.error as { message?: string })?.message ??
                      "Form vẫn mở được, nhưng bạn sẽ không thể chọn vai trò mới cho tài khoản."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <section className="mb-10 rounded-2xl border bg-background/90 p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Icons.users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground dark:text-zinc-100">Danh sách tài khoản nội bộ</h2>
                </div>
                <p className="text-sm text-muted-foreground dark:text-zinc-500">
                  Tìm kiếm theo tên, email, username hoặc số điện thoại, sau đó quản lý vai trò và trạng thái ngay trên bảng.
                </p>
              </div>
            </div>

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
          </section>
        </div>
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => {
          if (deleteMutation.isPending) return
          setDeleteTarget(null)
        }}
        title="Xóa tài khoản này?"
        message={
          deleteTarget
            ? `Tài khoản ${deleteTarget.name} (@${deleteTarget.username}) sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác.`
            : "Tài khoản được chọn sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác."
        }
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id)
        }}
        variant="danger"
        size="sm"
        isLoading={deleteMutation.isPending}
        loadingText="Đang xóa tài khoản"
      />
    </div>
  )
}
