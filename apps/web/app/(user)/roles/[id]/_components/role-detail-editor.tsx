"use client"

import { permissions, roles, type PermissionListItem } from "@/api"
import { Icons } from "@/components/global/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"

const roleDetailSchema = z.object({
  name: z.string().trim().min(1, "Tên vai trò không được để trống"),
  description: z.string().trim().optional(),
  permissionIds: z.array(z.string().uuid()),
})

type RoleDetailFormValues = z.infer<typeof roleDetailSchema>

type RoleDetailEditorProps = {
  roleId: string
}

const defaultValues: RoleDetailFormValues = {
  name: "",
  description: "",
  permissionIds: [],
}

export function RoleDetailEditor({ roleId }: RoleDetailEditorProps) {
  const queryClient = useQueryClient()

  const form = useForm<RoleDetailFormValues>({
    resolver: zodResolver(roleDetailSchema),
    defaultValues,
  })

  const roleQuery = useQuery({
    queryKey: ["roles", "detail", roleId],
    queryFn: () => roles.getById(roleId),
    enabled: Boolean(roleId),
  })

  const permissionsQuery = useQuery({
    queryKey: ["permissions", "all-for-role-edit"],
    queryFn: () =>
      permissions.getAll({
        page: 1,
        limit: 1000,
      }),
  })

  const allPermissions: PermissionListItem[] = permissionsQuery.data?.data?.items ?? []

  useEffect(() => {
    const role = roleQuery.data?.data
    if (!role) return

    form.reset({
      name: role.name ?? "",
      description: role.description ?? "",
      permissionIds: role.permissions?.map((item) => item.id) ?? [],
    })
  }, [form, roleQuery.data?.data])

  const updateMutation = useMutation({
    mutationFn: (payload: RoleDetailFormValues) =>
      roles.update(roleId, {
        name: payload.name.trim(),
        description: payload.description?.trim() || undefined,
        permissionIds: payload.permissionIds,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật vai trò thành công")
      void queryClient.invalidateQueries({ queryKey: ["roles", "list"] })
      void queryClient.invalidateQueries({ queryKey: ["roles", "detail", roleId] })
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật vai trò.")
    },
  })

  const selectedPermissionIds = useWatch({
    control: form.control,
    name: "permissionIds",
  })
  const selectedSet = new Set(selectedPermissionIds ?? [])

  const isLoading = roleQuery.isLoading || permissionsQuery.isLoading
  const hasError = roleQuery.isError || permissionsQuery.isError

  const onSubmit = (values: RoleDetailFormValues) => {
    const uniquePermissionIds = Array.from(new Set(values.permissionIds))
    updateMutation.mutate({
      ...values,
      permissionIds: uniquePermissionIds,
    })
  }

  if (isLoading) {
    return (
      <Card className="py-3">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu vai trò</p>
        </CardContent>
      </Card>
    )
  }

  if (hasError || !roleQuery.data?.data) {
    return (
      <Card className="py-3">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3">
          <Icons.alertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-foreground">Không thể tải dữ liệu vai trò</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void roleQuery.refetch()}>
              Tải lại
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link href="/roles">Quay lại danh sách</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-3">
      <CardHeader className="px-4 pb-0 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Chỉnh sửa vai trò và phân quyền</CardTitle>
            <p className="text-sm text-muted-foreground">Cập nhật tên, mô tả vai trò và chọn quyền được cấp.</p>
          </div>
          <Badge variant="outline">Role ID: {roleId}</Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="role-name">Vai trò</FieldLabel>
                <Input id="role-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="role-description">Miêu tả</FieldLabel>
                <Input
                  id="role-description"
                  aria-invalid={!!form.formState.errors.description}
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.permissionIds}>
              <FieldLabel>Danh sách quyền</FieldLabel>
              <p className="text-xs text-muted-foreground">
                Tích chọn quyền để cấp cho vai trò này. Đã chọn: {selectedSet.size}/{allPermissions.length}.
              </p>

              <Controller
                name="permissionIds"
                control={form.control}
                render={({ field }) => (
                  <div className="rounded-xl border border-border/70 p-3">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {allPermissions.map((permission) => {
                        const checked = selectedSet.has(permission.id)

                        return (
                          <label
                            key={permission.id}
                            className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={checked}
                              onCheckedChange={(nextValue) => {
                                const current = new Set(field.value ?? [])
                                if (nextValue) {
                                  current.add(permission.id)
                                } else {
                                  current.delete(permission.id)
                                }
                                field.onChange(Array.from(current))
                              }}
                            />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{permission.code}</p>
                              <p className="text-xs text-muted-foreground">
                                {permission.description || "Không có mô tả"}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              />
              <FieldError errors={[form.formState.errors.permissionIds]} />
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button asChild type="button" variant="outline" disabled={updateMutation.isPending}>
              <Link href="/roles">Quay lại</Link>
            </Button>
            <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Icons.spinner className="size-4 animate-spin" /> : null}
              Lưu cập nhật
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
