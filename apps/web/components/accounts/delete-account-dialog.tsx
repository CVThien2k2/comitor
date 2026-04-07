"use client"

import type { UserListItem } from "@/api"
import { Icons } from "@/components/global/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"

type DeleteAccountDialogProps = {
  open: boolean
  account: UserListItem | null
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteAccountDialog({
  open,
  account,
  isPending = false,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Icons.trash className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa tài khoản này?</AlertDialogTitle>
          <AlertDialogDescription>
            {account
              ? `Tài khoản ${account.name} (@${account.username}) sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác.`
              : "Tài khoản được chọn sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <Icons.spinner className="size-4 animate-spin" />}
            Xóa tài khoản
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
