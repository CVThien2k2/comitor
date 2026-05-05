"use client"

import { agentLevels, type AgentLevelListItem } from "@/api"
import { ConfirmDialog } from "@/components/global/confirm-dialog"
import { Icons } from "@/components/global/icons"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { useMemo, useState } from "react"

const agentLevelFormSchema = z.object({
  code: z.string().trim().min(1, "Mã cấp độ không được để trống"),
  description: z.string().trim().min(1, "Mô tả không được để trống"),
  yearsOfExperience: z.coerce.number().int().min(0, "Số năm kinh nghiệm tối thiểu là 0"),
  maxConcurrentConversations: z.coerce.number().int().min(1, "Số hội thoại tối đa phải lớn hơn 0"),
})

type AgentLevelFormSchema = z.infer<typeof agentLevelFormSchema>

const defaultValues: AgentLevelFormSchema = {
  code: "",
  description: "",
  yearsOfExperience: 0,
  maxConcurrentConversations: 1,
}

export function AgentLevelTable() {
  const queryClient = useQueryClient()

  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AgentLevelListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AgentLevelListItem | null>(null)

  const form = useForm<AgentLevelFormSchema>({
    resolver: zodResolver(agentLevelFormSchema),
    defaultValues,
  })

  const listQuery = useQuery({
    queryKey: ["agent-levels", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      agentLevels.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const createMutation = useMutation({
    mutationFn: (payload: AgentLevelFormSchema) =>
      agentLevels.create({
        code: payload.code.trim(),
        description: payload.description.trim(),
        yearsOfExperience: payload.yearsOfExperience,
        maxConcurrentConversations: payload.maxConcurrentConversations,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo cấp độ nhân viên thành công")
      void queryClient.invalidateQueries({ queryKey: ["agent-levels", "list"] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể tạo cấp độ nhân viên.")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AgentLevelFormSchema }) =>
      agentLevels.update(id, {
        code: payload.code.trim(),
        description: payload.description.trim(),
        yearsOfExperience: payload.yearsOfExperience,
        maxConcurrentConversations: payload.maxConcurrentConversations,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật cấp độ nhân viên thành công")
      void queryClient.invalidateQueries({ queryKey: ["agent-levels", "list"] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật cấp độ nhân viên.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentLevels.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa cấp độ nhân viên thành công")
      void queryClient.invalidateQueries({ queryKey: ["agent-levels", "list"] })
      setDeleteTarget(null)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể xóa cấp độ nhân viên.")
    },
  })

  const items = listQuery.data?.data?.items ?? []
  const meta = listQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const openCreateDialog = () => {
    setEditingItem(null)
    form.reset(defaultValues)
    setDialogOpen(true)
  }

  const openEditDialog = (item: AgentLevelListItem) => {
    setEditingItem(item)
    form.reset({
      code: item.code,
      description: item.description || "",
      yearsOfExperience: item.yearsOfExperience,
      maxConcurrentConversations: item.maxConcurrentConversations,
    })
    setDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<AgentLevelListItem>[]>(
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
        header: "Mã cấp độ",
        cell: ({ row }) => (
          <div className="min-w-48">
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
        accessorKey: "yearsOfExperience",
        enableSorting: false,
        header: "Kinh nghiệm",
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.yearsOfExperience} năm</span>,
      },
      {
        accessorKey: "maxConcurrentConversations",
        enableSorting: false,
        header: "Hội thoại tối đa",
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.maxConcurrentConversations}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DataTableRowAction onEdit={() => openEditDialog(row.original)} onDelete={() => setDeleteTarget(row.original)} />
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  )

  const onSubmit = (values: AgentLevelFormSchema) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload: values })
      return
    }

    createMutation.mutate(values)
  }

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách cấp độ nhân viên"
          description="Quản lý cấp độ kinh nghiệm và giới hạn hội thoại xử lý của nhân viên."
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
              setEditingItem(null)
              form.reset(defaultValues)
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa cấp độ nhân viên" : "Tạo cấp độ nhân viên mới"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Cập nhật thông tin cấp độ nhân viên và giới hạn xử lý hội thoại."
                  : "Nhập thông tin để tạo mới cấp độ nhân viên cho hệ thống."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-4">
                <Field data-invalid={!!form.formState.errors.code}>
                  <FieldLabel htmlFor="agent-level-code">Mã cấp độ</FieldLabel>
                  <Input
                    id="agent-level-code"
                    placeholder="Ví dụ: senior"
                    aria-invalid={!!form.formState.errors.code}
                    {...form.register("code")}
                  />
                  <FieldError errors={[form.formState.errors.code]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.description}>
                  <FieldLabel htmlFor="agent-level-description">Mô tả</FieldLabel>
                  <Input
                    id="agent-level-description"
                    placeholder="Ví dụ: Nhân sự có kinh nghiệm cao"
                    aria-invalid={!!form.formState.errors.description}
                    {...form.register("description")}
                  />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.yearsOfExperience}>
                    <FieldLabel htmlFor="agent-level-years-of-experience">Số năm kinh nghiệm</FieldLabel>
                    <Input
                      id="agent-level-years-of-experience"
                      type="number"
                      min={0}
                      aria-invalid={!!form.formState.errors.yearsOfExperience}
                      {...form.register("yearsOfExperience")}
                    />
                    <FieldError errors={[form.formState.errors.yearsOfExperience]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.maxConcurrentConversations}>
                    <FieldLabel htmlFor="agent-level-max-conversations">Số hội thoại tối đa</FieldLabel>
                    <Input
                      id="agent-level-max-conversations"
                      type="number"
                      min={1}
                      aria-invalid={!!form.formState.errors.maxConcurrentConversations}
                      {...form.register("maxConcurrentConversations")}
                    />
                    <FieldError errors={[form.formState.errors.maxConcurrentConversations]} />
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="gap-2" disabled={isSaving}>
                  {isSaving ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.plus className="size-4" />}
                  {editingItem ? "Lưu cập nhật" : "Tạo cấp độ"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xóa cấp độ nhân viên"
          message={
            deleteTarget
              ? `Cấp độ ${deleteTarget.code} sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?`
              : ""
          }
          confirmText="Xóa"
          variant="danger"
          isLoading={deleteMutation.isPending}
          loadingText="Đang xóa cấp độ..."
          onConfirm={() => {
            if (!deleteTarget) return
            deleteMutation.mutate(deleteTarget.id)
          }}
        />
      </CardContent>
    </Card>
  )
}
