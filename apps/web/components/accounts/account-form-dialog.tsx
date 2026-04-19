"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  type CreateUserPayload,
  type RoleListItem,
  type UpdateUserPayload,
  type UserListItem,
  uploadApi,
  users,
} from "@/api"
import { Icons } from "@/components/global/icons"
import { uploadOneImageWithProgress } from "@/lib/upload"
import { type AccountFormSchema, createAccountSchema, updateAccountSchema } from "@/lib/schema"
import type { PresignedData, UserProfile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"

type AccountFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  account: UserListItem | null
  roles: RoleListItem[]
  rolesError?: string
  onOpenChange: (open: boolean) => void
  onSuccess: (user: UserProfile | null) => void
}

const EMPTY_FORM_VALUES: AccountFormSchema = {
  name: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  avatarUrl: "",
  roleId: "",
  isActive: true,
}

const AVATAR_UPLOAD_FOLDER = "/uploads/avatars"

function getInitials(name: string) {
  const normalized = name.trim()

  if (!normalized) return "TK"

  const parts = normalized.split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getRoleLabel(roleName?: string | null) {
  switch (roleName?.trim().toLowerCase()) {
    case "system":
      return "Hệ thống"
    case "admin":
      return "Quản trị viên"
    case "user":
      return "Người dùng"
    default:
      return roleName ?? "Chưa gán vai trò"
  }
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "Chưa có dữ liệu"

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toOptionalText(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function getDefaultValues(mode: "create" | "edit", account: UserListItem | null): AccountFormSchema {
  if (mode === "create" || !account) return EMPTY_FORM_VALUES

  return {
    name: account.name,
    email: account.email,
    username: account.username,
    password: "",
    phone: account.phone ?? "",
    avatarUrl: account.avatarUrl ?? "",
    roleId: account.roleId ?? "",
    isActive: account.isActive,
  }
}

function buildCreatePayload(values: AccountFormSchema): CreateUserPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    username: values.username?.trim() ?? "",
    password: values.password ?? "",
    phone: toOptionalText(values.phone),
    roleId: toOptionalText(values.roleId),
  }
}

function buildUpdatePayload(values: AccountFormSchema, account: UserListItem): UpdateUserPayload {
  const payload: UpdateUserPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    isActive: values.isActive,
  }

  const phone = toOptionalText(values.phone)
  if (phone && phone !== account.phone) payload.phone = phone

  const avatarUrl = toOptionalText(values.avatarUrl)
  if (avatarUrl && avatarUrl !== account.avatarUrl) payload.avatarUrl = avatarUrl

  const roleId = toOptionalText(values.roleId)
  if (roleId && roleId !== account.roleId) payload.roleId = roleId

  return payload
}

export function AccountFormDialog({
  open,
  mode,
  account,
  roles,
  rolesError,
  onOpenChange,
  onSuccess,
}: AccountFormDialogProps) {
  const isEditMode = mode === "edit"
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [selectedAvatarPreviewUrl, setSelectedAvatarPreviewUrl] = useState<string | null>(null)
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number | null>(null)

  const form = useForm<AccountFormSchema>({
    resolver: zodResolver(isEditMode ? updateAccountSchema : createAccountSchema),
    defaultValues: getDefaultValues(mode, account),
  })

  useEffect(() => {
    if (!open) {
      setSelectedAvatarFile(null)
      setSelectedAvatarPreviewUrl(null)
      setAvatarUploadProgress(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      return
    }

    form.reset(getDefaultValues(mode, account))
    setSelectedAvatarFile(null)
    setSelectedAvatarPreviewUrl(null)
    setAvatarUploadProgress(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }, [account, form, mode, open])

  useEffect(() => {
    if (!selectedAvatarPreviewUrl?.startsWith("blob:")) return

    return () => {
      URL.revokeObjectURL(selectedAvatarPreviewUrl)
    }
  }, [selectedAvatarPreviewUrl])

  const saveMutation = useMutation({
    mutationFn: async (values: AccountFormSchema) => {
      if (isEditMode) {
        if (!account) throw new Error("Không tìm thấy tài khoản để cập nhật.")

        let uploadedAvatar: PresignedData | null = null

        try {
          const nextValues = { ...values }

          if (selectedAvatarFile) {
            setAvatarUploadProgress(0)
            uploadedAvatar = await uploadOneImageWithProgress({
              folder: AVATAR_UPLOAD_FOLDER,
              file: selectedAvatarFile,
              onProgress: (progress) => setAvatarUploadProgress(progress.percent),
            })
            nextValues.avatarUrl = uploadedAvatar.url
          }

          return users.update(account.id, buildUpdatePayload(nextValues, account))
        } catch (error) {
          if (uploadedAvatar) {
            void uploadApi.deleteFile({ key: uploadedAvatar.key }).catch(() => undefined)
          }

          throw error
        } finally {
          setAvatarUploadProgress(null)
        }
      }

      return users.create(buildCreatePayload(values))
    },
    onSuccess: (response) => {
      toast.success(response.message)
      onSuccess(response.data ?? null)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể lưu tài khoản. Vui lòng thử lại.")
    },
  })

  const watchedAvatarUrl = useWatch({
    control: form.control,
    name: "avatarUrl",
  })
  const watchedName = useWatch({
    control: form.control,
    name: "name",
  })
  const avatarPreview = selectedAvatarPreviewUrl || watchedAvatarUrl?.trim() || account?.avatarUrl || ""
  const title = isEditMode ? "Cập nhật tài khoản" : "Tạo tài khoản mới"
  const description = isEditMode
    ? "Chỉnh sửa thông tin đang được lưu trong bảng user và liên kết role hiện tại."
    : "Khởi tạo tài khoản nội bộ mới với thông tin từ bảng user."

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (saveMutation.isPending) return
    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: AccountFormSchema) => {
    saveMutation.mutate(values)
  }

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh hợp lệ.")
      event.target.value = ""
      return
    }

    setSelectedAvatarFile(file)
    setSelectedAvatarPreviewUrl(URL.createObjectURL(file))
    setAvatarUploadProgress(null)
    event.target.value = ""
  }

  const clearSelectedAvatarFile = () => {
    setSelectedAvatarFile(null)
    setSelectedAvatarPreviewUrl(null)
    setAvatarUploadProgress(null)

    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader className="border-b border-border/70 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar size="lg" className="size-12">
                {avatarPreview ? <AvatarImage src={avatarPreview} alt={account?.name ?? "Avatar preview"} /> : null}
                <AvatarFallback>{getInitials(watchedName || account?.name || "TK")}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                {isEditMode && account ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary">@{account.username}</Badge>
                    <Badge variant="outline">{getRoleLabel(account.role?.name)}</Badge>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </div>

            <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleDialogOpenChange(false)}>
              <Icons.x className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[78dvh]">
          <form id="account-form" className="space-y-5 px-6 py-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-border/70 bg-card/60 p-5">
                <div className="mb-4 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Thông tin chính</h3>
                  <p className="text-sm text-muted-foreground">
                    Các trường cốt lõi được lưu trong bảng user để phục vụ đăng nhập và quản trị.
                  </p>
                </div>

                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!form.formState.errors.name}>
                      <FieldLabel htmlFor="account-name">Họ và tên</FieldLabel>
                      <Input
                        id="account-name"
                        placeholder="Ví dụ: Nguyễn Minh Anh"
                        aria-invalid={!!form.formState.errors.name}
                        {...form.register("name")}
                      />
                      <FieldError errors={[form.formState.errors.name]} />
                    </Field>

                    <Field data-invalid={!!form.formState.errors.email}>
                      <FieldLabel htmlFor="account-email">Email</FieldLabel>
                      <Input
                        id="account-email"
                        type="email"
                        placeholder="tennguoidung@congty.vn"
                        aria-invalid={!!form.formState.errors.email}
                        {...form.register("email")}
                      />
                      <FieldError errors={[form.formState.errors.email]} />
                    </Field>

                    <Field data-invalid={!!form.formState.errors.username}>
                      <FieldLabel htmlFor="account-username">Tên đăng nhập</FieldLabel>
                      <Input
                        id="account-username"
                        placeholder="ten.dang.nhap"
                        disabled={isEditMode}
                        aria-invalid={!!form.formState.errors.username}
                        {...form.register("username")}
                      />
                      <FieldDescription>
                        {isEditMode
                          ? "Tên đăng nhập hiện chưa được API hỗ trợ cập nhật trên màn hình này."
                          : "Dùng để đăng nhập vào hệ thống."}
                      </FieldDescription>
                      <FieldError errors={[form.formState.errors.username]} />
                    </Field>

                    {isEditMode ? (
                      <Field>
                        <FieldLabel htmlFor="account-password-readonly">Mật khẩu</FieldLabel>
                        <Input id="account-password-readonly" type="password" value="********" disabled readOnly />
                        <FieldDescription>Mật khẩu hiện chưa được API hỗ trợ cập nhật ở trang này.</FieldDescription>
                      </Field>
                    ) : (
                      <Field data-invalid={!!form.formState.errors.password}>
                        <FieldLabel htmlFor="account-password">Mật khẩu khởi tạo</FieldLabel>
                        <Input
                          id="account-password"
                          type="password"
                          placeholder="Tối thiểu 6 ký tự"
                          aria-invalid={!!form.formState.errors.password}
                          {...form.register("password")}
                        />
                        <FieldError errors={[form.formState.errors.password]} />
                      </Field>
                    )}

                    <Field data-invalid={!!form.formState.errors.phone}>
                      <FieldLabel htmlFor="account-phone">Số điện thoại</FieldLabel>
                      <Input
                        id="account-phone"
                        placeholder="0901234567"
                        aria-invalid={!!form.formState.errors.phone}
                        {...form.register("phone")}
                      />
                      {isEditMode && (
                        <FieldDescription>Để trống sẽ giữ nguyên giá trị hiện tại của tài khoản.</FieldDescription>
                      )}
                      <FieldError errors={[form.formState.errors.phone]} />
                    </Field>

                    <Field data-invalid={!!form.formState.errors.roleId}>
                      <FieldLabel htmlFor="account-role">Vai trò</FieldLabel>
                      <Controller
                        name="roleId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                              disabled={!roles.length}
                            >
                              <SelectTrigger id="account-role" className="w-full" aria-invalid={fieldState.invalid}>
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {getRoleLabel(role.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              {rolesError
                                ? rolesError
                                : isEditMode
                                  ? "Nếu không thay đổi, hệ thống sẽ giữ nguyên vai trò hiện tại."
                                  : "Danh sách vai trò lấy từ bảng roles."}
                            </FieldDescription>
                            <FieldError errors={[fieldState.error]} />
                          </>
                        )}
                      />
                    </Field>

                    {isEditMode && (
                      <Field data-invalid={!!form.formState.errors.avatarUrl} className="sm:col-span-2">
                        <FieldLabel htmlFor="account-avatar-file">Ảnh đại diện</FieldLabel>
                        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-center">
                          <Avatar size="lg" className="size-16">
                            {avatarPreview ? (
                              <AvatarImage src={avatarPreview} alt={account?.name ?? "Avatar preview"} />
                            ) : null}
                            <AvatarFallback>{getInitials(watchedName || account?.name || "TK")}</AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1 space-y-2">
                            <input
                              ref={avatarInputRef}
                              id="account-avatar-file"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarFileChange}
                              disabled={saveMutation.isPending}
                            />

                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={saveMutation.isPending}
                              >
                                <Icons.upload className="size-4" />
                                {selectedAvatarFile ? "Đổi ảnh khác" : "Chọn ảnh"}
                              </Button>

                              {selectedAvatarFile ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={clearSelectedAvatarFile}
                                  disabled={saveMutation.isPending}
                                >
                                  <Icons.x className="size-4" />
                                  Bỏ ảnh mới
                                </Button>
                              ) : null}
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p className="truncate">
                                {selectedAvatarFile
                                  ? `Đã chọn: ${selectedAvatarFile.name}`
                                  : "Chọn ảnh JPG, PNG, WEBP hoặc GIF để cập nhật avatar."}
                              </p>
                            </div>
                          </div>
                        </div>
                        <FieldDescription>
                          Nếu không chọn ảnh mới, hệ thống sẽ giữ nguyên avatar hiện tại.
                        </FieldDescription>
                        <FieldError errors={[form.formState.errors.avatarUrl]} />
                      </Field>
                    )}
                  </div>
                </FieldGroup>
              </section>

              <section className="space-y-5">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
                  <div className="mb-4 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Trạng thái vận hành</h3>
                    <p className="text-sm text-muted-foreground">
                      Theo dõi nhanh trạng thái tài khoản và các tín hiệu liên quan.
                    </p>
                  </div>

                  <FieldGroup className="gap-4">
                    <Controller
                      name="isActive"
                      control={form.control}
                      render={({ field }) => (
                        <Field
                          orientation="horizontal"
                          className="rounded-2xl border border-border/70 bg-background/70 p-4"
                        >
                          <Checkbox
                            id="account-is-active"
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            disabled={!isEditMode}
                          />
                          <FieldContent>
                            <FieldTitle>Kích hoạt tài khoản</FieldTitle>
                            <FieldDescription>
                              {isEditMode
                                ? "Tắt trạng thái này để ngưng cho tài khoản đăng nhập và thao tác."
                                : "Tài khoản mới sẽ được tạo ở trạng thái hoạt động."}
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      )}
                    />

                    {!isEditMode && (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                        Sau khi tạo, bạn có thể quay lại dòng dữ liệu để cập nhật avatar, trạng thái kích hoạt hoặc các
                        trường tùy chọn khác.
                      </div>
                    )}

                    {isEditMode && account && (
                      <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={account.emailVerified ? "default" : "outline"}>
                            {account.emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
                          </Badge>
                          <Badge variant={account.isOnline ? "default" : "secondary"}>
                            {account.isOnline ? "Đang online" : "Đang offline"}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Tạo lúc: {formatDateTime(account.createdAt)}</p>
                          <p>Cập nhật gần nhất: {formatDateTime(account.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </FieldGroup>
                </div>
              </section>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="mx-0 mb-0 border-t border-border/70 bg-background px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Hủy
          </Button>
          <Button type="submit" form="account-form" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Icons.spinner className="size-4 animate-spin" />}
            {isEditMode ? "Lưu thay đổi" : "Tạo tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
