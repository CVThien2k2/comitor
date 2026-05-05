"use client"

import {
  suggestedMessages,
  type CreateSuggestedMessagePayload,
  type SuggestedMessageItem,
  type UpdateSuggestedMessagePayload,
} from "@/api"
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
import { Textarea } from "@workspace/ui/components/textarea"
import { useMemo, useState } from "react"

const suggestedMessageFormSchema = z.object({
  tag: z.string().trim().min(1, "Nhãn không được để trống").max(100, "Nhãn tối đa 100 ký tự"),
  message: z.string().trim().min(1, "Nội dung không được để trống"),
  imagesText: z.string().optional(),
})

type SuggestedMessageFormValues = z.infer<typeof suggestedMessageFormSchema>

const defaultValues: SuggestedMessageFormValues = {
  tag: "",
  message: "",
  imagesText: "",
}

function toPayload(values: SuggestedMessageFormValues): CreateSuggestedMessagePayload {
  const images =
    values.imagesText
      ?.split("\n")
      .map((item) => item.trim())
      .filter(Boolean) ?? []

  return {
    tag: values.tag.trim(),
    message: values.message.trim(),
    ...(images.length > 0 ? { images } : {}),
  }
}

function toUpdatePayload(values: SuggestedMessageFormValues): UpdateSuggestedMessagePayload {
  const payload = toPayload(values)
  return {
    tag: payload.tag,
    message: payload.message,
    images: payload.images ?? [],
  }
}

export function SuggestedMessageTable() {
  const queryClient = useQueryClient()

  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SuggestedMessageItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SuggestedMessageItem | null>(null)

  const form = useForm<SuggestedMessageFormValues>({
    resolver: zodResolver(suggestedMessageFormSchema),
    defaultValues,
  })

  const listQuery = useQuery({
    queryKey: ["suggested-messages", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      suggestedMessages.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const createMutation = useMutation({
    mutationFn: (payload: SuggestedMessageFormValues) => suggestedMessages.create(toPayload(payload)),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo tin nhắn gợi ý thành công")
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages", "list"] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể tạo tin nhắn gợi ý.")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuggestedMessageFormValues }) =>
      suggestedMessages.update(id, toUpdatePayload(payload)),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật tin nhắn gợi ý thành công")
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages", "list"] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset(defaultValues)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật tin nhắn gợi ý.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suggestedMessages.remove(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa tin nhắn gợi ý thành công")
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages", "list"] })
      setDeleteTarget(null)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể xóa tin nhắn gợi ý.")
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

  const openEditDialog = (item: SuggestedMessageItem) => {
    setEditingItem(item)
    form.reset({
      tag: item.tag ?? "",
      message: item.message ?? "",
      imagesText: (item.images ?? []).join("\n"),
    })
    setDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<SuggestedMessageItem>[]>(
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
        accessorKey: "tag",
        enableSorting: false,
        header: "Nhãn",
        cell: ({ row }) => (
          <div className="min-w-44">
            <Badge variant="secondary">{row.original.tag}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "message",
        enableSorting: false,
        header: "Nội dung gợi ý",
        cell: ({ row }) => <p className="max-w-[44rem] whitespace-pre-wrap text-sm text-foreground">{row.original.message}</p>,
      },
      {
        id: "images",
        enableSorting: false,
        header: "Ảnh đính kèm",
        cell: ({ row }) => {
          const imageCount = row.original.images?.length ?? 0
          return imageCount > 0 ? (
            <Badge variant="outline">{imageCount} ảnh</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Không có</span>
          )
        },
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

  const onSubmit = (values: SuggestedMessageFormValues) => {
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
          title="Danh sách tin nhắn gợi ý"
          description="Quản lý mẫu nội dung gợi ý để hỗ trợ tư vấn viên phản hồi khách hàng nhanh hơn."
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
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa tin nhắn gợi ý" : "Tạo tin nhắn gợi ý mới"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Cập nhật nhãn, nội dung và danh sách ảnh đính kèm cho mẫu gợi ý."
                  : "Nhập thông tin để tạo mẫu tin nhắn gợi ý mới cho hệ thống."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-4">
                <Field data-invalid={!!form.formState.errors.tag}>
                  <FieldLabel htmlFor="suggested-message-tag">Nhãn</FieldLabel>
                  <Input
                    id="suggested-message-tag"
                    placeholder="Ví dụ: chao_mung_khach_moi"
                    aria-invalid={!!form.formState.errors.tag}
                    {...form.register("tag")}
                  />
                  <FieldError errors={[form.formState.errors.tag]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.message}>
                  <FieldLabel htmlFor="suggested-message-content">Nội dung</FieldLabel>
                  <Textarea
                    id="suggested-message-content"
                    rows={6}
                    placeholder="Nhập nội dung tin nhắn gợi ý..."
                    aria-invalid={!!form.formState.errors.message}
                    {...form.register("message")}
                  />
                  <FieldError errors={[form.formState.errors.message]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.imagesText}>
                  <FieldLabel htmlFor="suggested-message-images">Danh sách URL ảnh</FieldLabel>
                  <Textarea
                    id="suggested-message-images"
                    rows={4}
                    placeholder={"Mỗi dòng 1 URL ảnh\nhttps://example.com/image-1.jpg"}
                    aria-invalid={!!form.formState.errors.imagesText}
                    {...form.register("imagesText")}
                  />
                  <FieldError errors={[form.formState.errors.imagesText]} />
                </Field>
              </FieldGroup>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="gap-2" disabled={isSaving}>
                  {isSaving ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.plus className="size-4" />}
                  {editingItem ? "Lưu cập nhật" : "Tạo tin nhắn"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xóa tin nhắn gợi ý"
          message={
            deleteTarget
              ? `Tin nhắn gợi ý nhãn "${deleteTarget.tag}" sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?`
              : ""
          }
          confirmText="Xóa"
          variant="danger"
          isLoading={deleteMutation.isPending}
          loadingText="Đang xóa tin nhắn..."
          onConfirm={() => {
            if (!deleteTarget) return
            deleteMutation.mutate(deleteTarget.id)
          }}
        />
      </CardContent>
    </Card>
  )
}

