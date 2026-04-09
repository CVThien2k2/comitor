"use client"

import { suggestedMessages } from "@/api/suggested-messages"
import { Icons } from "@/components/global/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type UpdateSuggestedMessageDialogItem = {
  id: string
  tag: string
  message: string
}

type UpdateSuggestedMessageDialogProps = {
  open: boolean
  item: UpdateSuggestedMessageDialogItem | null
  onOpenChange: (open: boolean) => void
}

type UpdateSuggestedMessageForm = {
  tag: string
  message: string
}

export function UpdateSuggestedMessageDialog({ open, item, onOpenChange }: UpdateSuggestedMessageDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<UpdateSuggestedMessageForm>({
    defaultValues: {
      tag: "",
      message: "",
    },
  })

  useEffect(() => {
    if (!open || !item) {
      form.reset({ tag: "", message: "" })
      return
    }
    form.reset({ tag: item.tag, message: item.message })
  }, [form, item, open])

  const updateMutation = useMutation({
    mutationFn: (values: UpdateSuggestedMessageForm) => {
      if (!item) throw new Error("Không tìm thấy bản ghi cần sửa.")
      return suggestedMessages.update(item.id, {
        tag: values.tag.trim(),
        message: values.message.trim(),
      })
    },
    onSuccess: () => {
      toast.success("Đã cập nhật tin nhắn nhanh.")
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages"] })
    },
    onError: () => {
      toast.error("Không thể cập nhật tin nhắn nhanh.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!values.tag.trim() || !values.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tag và nội dung.")
      return
    }
    updateMutation.mutate(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật tin nhắn nhanh</DialogTitle>
          <DialogDescription>Chỉnh sửa tag và nội dung của tin nhắn nhanh.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Tag</label>
            <Input placeholder="vd: luuykhach" disabled={updateMutation.isPending} {...form.register("tag", { required: true })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Nội dung</label>
            <textarea
              className="min-h-[96px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Nhập nội dung tin nhắn nhanh"
              disabled={updateMutation.isPending}
              {...form.register("message", { required: true })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !item}>
              {updateMutation.isPending ? <Icons.spinner className="size-4 animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
