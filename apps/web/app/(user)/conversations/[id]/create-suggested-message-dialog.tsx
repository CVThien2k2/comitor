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

type CreateSuggestedMessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CreateSuggestedMessageForm = {
  tag: string
  message: string
}

export function CreateSuggestedMessageDialog({ open, onOpenChange }: CreateSuggestedMessageDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<CreateSuggestedMessageForm>({
    defaultValues: {
      tag: "",
      message: "",
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ tag: "", message: "" })
    }
  }, [form, open])

  const createMutation = useMutation({
    mutationFn: (values: CreateSuggestedMessageForm) =>
      suggestedMessages.create({
        tag: values.tag.trim(),
        message: values.message.trim(),
        images: [],
      }),
    onSuccess: () => {
      toast.success("Đã tạo tin nhắn nhanh.")
      onOpenChange(false)
      form.reset({ tag: "", message: "" })
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages"] })
    },
    onError: () => {
      toast.error("Không thể tạo tin nhắn nhanh.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!values.tag.trim() || !values.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tag và nội dung.")
      return
    }
    createMutation.mutate(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo tin nhắn nhanh</DialogTitle>
          <DialogDescription>Nhập tag và nội dung để tạo tin nhắn nhanh mới.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Tag</label>
            <Input placeholder="vd: luuykhach" disabled={createMutation.isPending} {...form.register("tag", { required: true })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Nội dung</label>
            <textarea
              className="min-h-[96px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Nhập nội dung tin nhắn nhanh"
              disabled={createMutation.isPending}
              {...form.register("message", { required: true })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Icons.spinner className="size-4 animate-spin" /> : null}
              Tạo mới
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
