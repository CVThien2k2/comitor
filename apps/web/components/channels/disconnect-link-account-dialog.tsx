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

interface DisconnectLinkAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelName: string
  onConfirm?: () => Promise<unknown> | void
  isPending?: boolean
}

const DisconnectLinkAccountDialog: React.FC<DisconnectLinkAccountDialogProps> = ({
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
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Ngắt kết nối kênh này?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đang chuẩn bị ngắt kết nối tài khoản <strong>{channelName}</strong>. Tạm thời xác nhận chỉ cập nhật
            trạng thái kết nối của kênh này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Icons.spinner className="size-4 animate-spin" /> : null}
            Xác nhận
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DisconnectLinkAccountDialog
