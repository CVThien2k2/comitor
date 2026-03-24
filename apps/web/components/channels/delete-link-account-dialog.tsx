"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "../global/icons"

interface DeleteLinkAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelName: string
  onConfirm?: () => Promise<unknown> | void
  isPending?: boolean
}

const DeleteLinkAccountDialog: React.FC<DeleteLinkAccountDialogProps> = ({
  open,
  onOpenChange,
  channelName,
  onConfirm,
  isPending = false,
}) => {
  const handleConfirm = async () => {
    if (!onConfirm) return

    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Toast is handled by the mutation owner.
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá vĩnh viễn liên kết này?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đang chuẩn bị xoá vĩnh viễn tài khoản <strong>{channelName}</strong>. Hành động này sẽ xoá toàn bộ cuộc
            trò chuyện, thông tin liên quan của tài khoản này khỏi hệ thống và không thể khôi phục lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Icons.spinner className="size-4 animate-spin" /> : null}
            Xoá liên kết
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteLinkAccountDialog
