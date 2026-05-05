"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type PermissionListItem, permissions } from "@/api"
import { Icons } from "@/components/global/icons"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
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
import { useCallback, useMemo, useState } from "react"
import { Textarea } from "@workspace/ui/components/textarea"

const permissionDescriptionSchema = z.object({
  description: z.string().trim().min(1, "Mô tả không được để trống"),
})

type PermissionDescriptionFormValues = z.infer<typeof permissionDescriptionSchema>

const defaultValues: PermissionDescriptionFormValues = {
  description: "",
}

export function PermissionTable() {
  const queryClient = useQueryClient()
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PermissionListItem | null>(null)

  const form = useForm<PermissionDescriptionFormValues>({
    resolver: zodResolver(permissionDescriptionSchema),
    defaultValues,
  })

  const permissionsQuery = useQuery({
    queryKey: ["permissions", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      permissions.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const items = permissionsQuery.data?.data?.items ?? []
  const meta = permissionsQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PermissionDescriptionFormValues }) =>
      permissions.updateDescription(id, { description: payload.description.trim() }),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật mô tả quyền thành công")
      void queryClient.invalidateQueries({ queryKey: ["permissions", "list"] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật mô tả quyền.")
    },
  })

  const isSaving = updateMutation.isPending

  const openEditDialog = useCallback(
    (item: PermissionListItem) => {
      setEditingItem(item)
      form.reset({
        description: item.description ?? "",
      })
      setDialogOpen(true)
    },
    [form]
  )

  const columns = useMemo<ColumnDef<PermissionListItem>[]>(
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
        accessorKey: "code",
        enableSorting: false,
        header: "Mã quyền",
        cell: ({ row }) => (
          <div className="min-w-64">
            <Badge variant="secondary">{row.original.code}</Badge>
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
        cell: ({ row }) => {
          const permission = row.original

          return (
            <div className="flex justify-end">
              <DataTableRowAction onEdit={() => openEditDialog(permission)} />
            </div>
          )
        },
      },
    ],
    [openEditDialog, pagination.pageIndex, pagination.pageSize]
  )

  const onSubmit = (values: PermissionDescriptionFormValues) => {
    if (!editingItem) return
    updateMutation.mutate({ id: editingItem.id, payload: values })
  }

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách quyền"
          description="Danh sách mã quyền đang dùng để phân quyền truy cập và thao tác trên hệ thống."
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
          isLoading={permissionsQuery.isFetching}
          viewOptions
        />

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open && isSaving) return
            setDialogOpen(open)
            if (!open) {
              setEditingItem(null)
              form.reset(defaultValues)
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa mô tả quyền</DialogTitle>
              <DialogDescription>Chỉ được phép cập nhật mô tả. Mã quyền được giữ cố định.</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="permission-code">Mã quyền</FieldLabel>
                  <Input id="permission-code" value={editingItem?.code ?? ""} readOnly disabled />
                </Field>

                <Field data-invalid={!!form.formState.errors.description}>
                  <FieldLabel htmlFor="permission-description">Mô tả</FieldLabel>
                  <Textarea
                    id="permission-description"
                    rows={4}
                    placeholder="Nhập mô tả quyền..."
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
                  {isSaving ? <Icons.spinner className="size-4 animate-spin" /> : null}
                  Lưu cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
