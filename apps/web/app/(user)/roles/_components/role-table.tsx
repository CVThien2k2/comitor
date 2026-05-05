"use client"

import { type RoleListItem, roles } from "@/api"
import { ConfirmDialog } from "@/components/global/confirm-dialog"
import { Icons } from "@/components/global/icons"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { useMemo, useState } from "react"

const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Tên vai trò không được để trống"),
  description: z.string().trim().optional(),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
}

export function RoleTable() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  })

  const listQuery = useQuery({
    queryKey: ["roles", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      roles.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const createMutation = useMutation({
    mutationFn: (payload: RoleFormValues) =>
      roles.create({
        name: payload.name.trim(),
        description: payload.description?.trim() || undefined,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo vai trò thành công")
      void queryClient.invalidateQueries({ queryKey: ["roles", "list"] })
      setDialogOpen(false)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể tạo vai trò.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roles.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa vai trò thành công")
      void queryClient.invalidateQueries({ queryKey: ["roles", "list"] })
      setDeleteTarget(null)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể xóa vai trò.")
    },
  })

  const items = listQuery.data?.data?.items ?? []
  const meta = listQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)
  const isSaving = createMutation.isPending

  const openCreateDialog = () => {
    form.reset(defaultValues)
    setDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<RoleListItem>[]>(
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
        accessorKey: "name",
        enableSorting: false,
        header: "Vai trò",
        cell: ({ row }) => (
          <div className="min-w-64">
            <Badge variant="secondary">{row.original.name}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "description",
        enableSorting: false,
        header: "Mô tả",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description || "-"}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DataTableRowAction
              onEdit={() => router.push(`/roles/${row.original.id}`)}
              onDelete={() => setDeleteTarget(row.original)}
            />
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize, router]
  )

  const onSubmit = (values: RoleFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách vai trò"
          description="Quản lý nhóm vai trò và mô tả phạm vi trách nhiệm cho người dùng trong hệ thống."
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
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <Icons.plus className="size-4" />
              Thêm mới
            </Button>
          }
          isLoading={listQuery.isFetching}
          viewOptions
        />

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open && isSaving) return
            setDialogOpen(open)
            if (!open) {
              form.reset(defaultValues)
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo vai trò mới</DialogTitle>
              <DialogDescription>Nhập thông tin để tạo vai trò mới.</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-4">
                <Field data-invalid={!!form.formState.errors.name}>
                  <FieldLabel htmlFor="role-name">Tên vai trò</FieldLabel>
                  <Input
                    id="role-name"
                    placeholder="Ví dụ: editor"
                    aria-invalid={!!form.formState.errors.name}
                    {...form.register("name")}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.description}>
                  <FieldLabel htmlFor="role-description">Mô tả</FieldLabel>
                  <Input
                    id="role-description"
                    placeholder="Ví dụ: Vai trò biên tập viên"
                    aria-invalid={!!form.formState.errors.description}
                    {...form.register("description")}
                  />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>
              </FieldGroup>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="gap-2" disabled={isSaving}>
                  {isSaving ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.plus className="size-4" />}
                  Tạo vai trò
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xóa vai trò"
          message={deleteTarget ? `Vai trò ${deleteTarget.name} sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?` : ""}
          confirmText="Xóa"
          variant="danger"
          isLoading={deleteMutation.isPending}
          loadingText="Đang xóa vai trò..."
          onConfirm={() => {
            if (!deleteTarget) return
            deleteMutation.mutate(deleteTarget.id)
          }}
        />
      </CardContent>
    </Card>
  )
}
