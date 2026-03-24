"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { roles, users, type CreateUserPayload, type RoleItem } from "@/api"
import { Icons } from "@/components/global/icons"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { createUserSchema, type CreateUserForm } from "@/lib/schema"

type UserItem = {
  id: string
  name: string
  email: string
  username: string
  isActive: boolean
  role?: { id: string; name: string } | null
}

const initialForm: CreateUserForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  roleId: "",
}

export default function UsersPage() {
  const [items, setItems] = useState<UserItem[]>([])
  const [roleItems, setRoleItems] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: initialForm,
  })

  async function fetchData() {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([users.list({ page: 1, limit: 20 }), roles.list()])
      setItems((usersRes.data?.items as UserItem[]) || [])
      setRoleItems(rolesRes.data?.items || [])
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message ?? "Không tải được dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function onCreateUser(values: CreateUserForm) {
    setSubmitting(true)
    try {
      const payload: CreateUserPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
        roleId: values.roleId,
      }
      await users.create(payload)
      form.reset(initialForm)
      toast.success("Tạo tài khoản thành công")
      await fetchData()
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message ?? "Tạo tài khoản thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 flex items-center justify-between px-8 py-6 border-b border-border/50 bg-card/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản lý tài khoản</h1>
            <p className="text-muted-foreground mt-0.5">
              Xem danh sách tài khoản và tạo tài khoản mới.
            </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">    
      <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tạo tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onCreateUser)}>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Họ tên</FieldLabel>
                    <Input id="name" placeholder="Nguyễn Văn A" {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="user@company.com" {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                    <Input id="username" placeholder="nguyenvana" {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <Input id="password" type="password" placeholder="Tối thiểu 6 ký tự" {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Số điện thoại (tuỳ chọn)</FieldLabel>
                    <Input id="phone" placeholder="0901234567" value={field.value ?? ""} onChange={field.onChange} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="roleId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Vai trò</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleItems.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="mt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Icons.spinner className="size-4 animate-spin" /> : "Tạo tài khoản"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
          <CardDescription>Các tài khoản trong hệ thống và role hiện tại.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Icons.spinner className="size-4 animate-spin" />
              <span>Đang tải...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Chưa có tài khoản</div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Hoạt động" : "Khoá"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  )
}
