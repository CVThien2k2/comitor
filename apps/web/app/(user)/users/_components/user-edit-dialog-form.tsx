"use client"

import { users, type UserListItem } from "@/api"
import { AgentLevelLazySelect } from "./agent-level-lazy-select"
import { RoleLazySelect } from "./role-lazy-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { useEffect } from "react"

const updateUserPopupSchema = z.object({
  name: z.string().trim().min(1, "Tên hiển thị không được để trống"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().optional(),
  roleId: z.union([z.literal(""), z.string().uuid("Vai trò không hợp lệ")]).optional(),
  agentLevelId: z.string().trim().min(1, "Cấp độ nhân viên không được để trống").uuid("Cấp độ nhân viên không hợp lệ"),
  isActive: z.boolean(),
})

type UpdateUserPopupSchema = z.infer<typeof updateUserPopupSchema>

type UserEditDialogFormProps = {
  open: boolean
  user: UserListItem | null
  onCancel: () => void
  onUpdated: () => void
}

export function UserEditDialogForm({ open, user, onCancel, onUpdated }: UserEditDialogFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateUserPopupSchema>({
    resolver: zodResolver(updateUserPopupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
      agentLevelId: "",
      isActive: true,
    },
  })
  const isActive = useWatch({ control: form.control, name: "isActive" })

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        roleId: user.roleId ?? user.role?.id ?? "",
        agentLevelId: user.agentLevelId ?? user.agentLevel?.id ?? "",
        isActive: Boolean(user.isActive),
      })
      return
    }

    if (!open) {
      form.reset()
    }
  }, [form, open, user])

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPopupSchema }) =>
      users.update(id, {
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() ? payload.phone.trim() : undefined,
        roleId: payload.roleId?.trim() ? payload.roleId.trim() : undefined,
        agentLevelId: payload.agentLevelId.trim(),
        isActive: payload.isActive,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật người dùng thành công")
      void queryClient.invalidateQueries({ queryKey: ["users", "list"] })
      onUpdated()
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật người dùng.")
    },
  })

  const onSubmit = (values: UpdateUserPopupSchema) => {
    if (!user) return
    updateUserMutation.mutate({ id: user.id, payload: values })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="edit-user-name">Họ tên</FieldLabel>
            <Input
              id="edit-user-name"
              placeholder="Ví dụ: Nguyễn Văn A"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="edit-user-email">Email</FieldLabel>
            <Input
              id="edit-user-email"
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-user-username">Tên đăng nhập</FieldLabel>
            <Input
              id="edit-user-username"
              value={user?.username ?? ""}
              disabled
              readOnly
            />
          </Field>

          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="edit-user-phone">Số điện thoại</FieldLabel>
            <Input
              id="edit-user-phone"
              placeholder="0901234567"
              aria-invalid={!!form.formState.errors.phone}
              {...form.register("phone")}
            />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.roleId}>
            <FieldLabel htmlFor="edit-user-role">Vai trò</FieldLabel>
            <Controller
              name="roleId"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <RoleLazySelect
                    id="edit-user-role"
                    value={field.value}
                    onValueChange={field.onChange}
                    ariaInvalid={fieldState.invalid}
                    selectedLabel={user?.role?.name}
                  />
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>

          <Field data-invalid={!!form.formState.errors.agentLevelId}>
            <FieldLabel htmlFor="edit-user-agent-level">Cấp độ nhân viên</FieldLabel>
            <Controller
              name="agentLevelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <AgentLevelLazySelect
                    id="edit-user-agent-level"
                    value={field.value}
                    onValueChange={field.onChange}
                    ariaInvalid={fieldState.invalid}
                    selectedLabel={user?.agentLevel?.code}
                  />
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>
        </div>

        <Field data-invalid={!!form.formState.errors.isActive}>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-user-is-active"
              checked={isActive}
              onCheckedChange={(value) => form.setValue("isActive", Boolean(value), { shouldValidate: true })}
            />
            <FieldLabel htmlFor="edit-user-is-active">Kích hoạt tài khoản</FieldLabel>
          </div>
          <FieldError errors={[form.formState.errors.isActive]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" disabled={updateUserMutation.isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="gap-2" disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending ? "Đang lưu" : "Lưu cập nhật"}
        </Button>
      </div>
    </form>
  )
}
