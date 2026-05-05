"use client"

import { users } from "@/api"
import { AgentLevelLazySelect } from "./agent-level-lazy-select"
import { Icons } from "@/components/global/icons"
import { RoleLazySelect } from "./role-lazy-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { useEffect } from "react"

const createUserPopupSchema = z.object({
  name: z.string().trim().min(1, "Tên hiển thị không được để trống"),
  email: z.string().trim().email("Email không hợp lệ"),
  username: z.string().trim().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  phone: z.string().trim().optional(),
  roleId: z.union([z.literal(""), z.string().uuid("Vai trò không hợp lệ")]).optional(),
  agentLevelId: z.string().trim().min(1, "Cấp độ nhân viên không được để trống").uuid("Cấp độ nhân viên không hợp lệ"),
})

type CreateUserPopupSchema = z.infer<typeof createUserPopupSchema>

type UserCreateDialogFormProps = {
  open: boolean
  onCancel: () => void
  onCreated: () => void
}

export function UserCreateDialogForm({ open, onCancel, onCreated }: UserCreateDialogFormProps) {
  const queryClient = useQueryClient()

  const createForm = useForm<CreateUserPopupSchema>({
    resolver: zodResolver(createUserPopupSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      roleId: "",
      agentLevelId: "",
    },
  })

  useEffect(() => {
    if (!open) {
      createForm.reset()
    }
  }, [createForm, open])

  const createUserMutation = useMutation({
    mutationFn: (values: CreateUserPopupSchema) =>
      users.create({
        name: values.name.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
        roleId: values.roleId?.trim() ? values.roleId.trim() : undefined,
        agentLevelId: values.agentLevelId.trim(),
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo người dùng thành công")
      void queryClient.invalidateQueries({ queryKey: ["users", "list"] })
      onCreated()
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể tạo người dùng.")
    },
  })

  const onSubmitCreateUser = (values: CreateUserPopupSchema) => {
    createUserMutation.mutate(values)
  }

  return (
    <form onSubmit={createForm.handleSubmit(onSubmitCreateUser)} className="space-y-6">
      <FieldGroup className="gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!createForm.formState.errors.name}>
            <FieldLabel htmlFor="create-user-name">Họ tên</FieldLabel>
            <Input
              id="create-user-name"
              placeholder="Ví dụ: Nguyễn Văn A"
              aria-invalid={!!createForm.formState.errors.name}
              {...createForm.register("name")}
            />
            <FieldError errors={[createForm.formState.errors.name]} />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.email}>
            <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
            <Input
              id="create-user-email"
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!createForm.formState.errors.email}
              {...createForm.register("email")}
            />
            <FieldError errors={[createForm.formState.errors.email]} />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.username}>
            <FieldLabel htmlFor="create-user-username">Tên đăng nhập</FieldLabel>
            <Input
              id="create-user-username"
              placeholder="ten.dang.nhap"
              aria-invalid={!!createForm.formState.errors.username}
              {...createForm.register("username")}
            />
            <FieldError errors={[createForm.formState.errors.username]} />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.password}>
            <FieldLabel htmlFor="create-user-password">Mật khẩu</FieldLabel>
            <Input
              id="create-user-password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              aria-invalid={!!createForm.formState.errors.password}
              {...createForm.register("password")}
            />
            <FieldError errors={[createForm.formState.errors.password]} />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.phone}>
            <FieldLabel htmlFor="create-user-phone">Số điện thoại</FieldLabel>
            <Input
              id="create-user-phone"
              placeholder="0901234567"
              aria-invalid={!!createForm.formState.errors.phone}
              {...createForm.register("phone")}
            />
            <FieldError errors={[createForm.formState.errors.phone]} />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.roleId}>
            <FieldLabel htmlFor="create-user-role">Vai trò</FieldLabel>
            <Controller
              name="roleId"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <>
                  <RoleLazySelect
                    id="create-user-role"
                    value={field.value}
                    onValueChange={field.onChange}
                    ariaInvalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>

          <Field data-invalid={!!createForm.formState.errors.agentLevelId}>
            <FieldLabel htmlFor="create-user-agent-level">Cấp độ nhân viên</FieldLabel>
            <Controller
              name="agentLevelId"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <>
                  <AgentLevelLazySelect
                    id="create-user-agent-level"
                    value={field.value}
                    onValueChange={field.onChange}
                    ariaInvalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" disabled={createUserMutation.isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="gap-2" disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.plus className="size-4" />}
          Tạo người dùng
        </Button>
      </div>
    </form>
  )
}
