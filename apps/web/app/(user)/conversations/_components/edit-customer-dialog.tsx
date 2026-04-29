"use client"

import { goldenProfiles, type GoldenProfileDetail } from "@/api/golden-profiles"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { Icons } from "@/components/global/icons"
import { getConversationDisplayName, getProviderLabel } from "@/lib/helper"
import { editGoldenProfileSchema, type EditGoldenProfileSchema } from "@/lib/schema/golden-profile"
import type { ApiResponse, ConversationItem, UpdateGoldenProfilePayload } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
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
import { Textarea } from "@workspace/ui/components/textarea"
import { useEffect, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"

const EMPTY_FORM_VALUES: EditGoldenProfileSchema = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  primaryPhone: "",
  primaryEmail: "",
  address: "",
  city: "",
  memberTier: "",
  loyaltyPoints: 0,
  customerType: "individual",
  elinesCustomerId: "",
  isBlacklisted: false,
  journeyState: "",
  characteristics: "",
  staffNotes: "",
}

const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
] as const

const CUSTOMER_TYPE_OPTIONS = [
  { value: "individual", label: "Cá nhân" },
  { value: "business", label: "Doanh nghiệp" },
  { value: "agent", label: "Đại lý" },
] as const

const MEMBER_TIER_OPTIONS = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
] as const

const JOURNEY_STATE_OPTIONS = [
  { value: "searching", label: "Đang tìm kiếm" },
  { value: "holding", label: "Đang giữ chỗ" },
  { value: "ticketed", label: "Đã xuất vé" },
  { value: "cancelled", label: "Đã hủy" },
] as const

const FALLBACK_CUSTOMER_NAME = "Khách hàng"
const UNSET_SELECT_VALUE = "__unset__"

type EditCustomerDialogProps = {
  conversation: ConversationItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SaveMutationVariables = {
  payload: UpdateGoldenProfilePayload
  previousFullName: string | null
}

function toOptionalValue(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function buildFormValues(profile?: GoldenProfileDetail | null): EditGoldenProfileSchema {
  if (!profile) return EMPTY_FORM_VALUES

  return {
    fullName: profile.fullName ?? "",
    gender: profile.gender ?? "",
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    primaryPhone: profile.primaryPhone ?? "",
    primaryEmail: profile.primaryEmail ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    memberTier: profile.memberTier ?? "",
    loyaltyPoints: profile.loyaltyPoints ?? 0,
    customerType: profile.customerType ?? "individual",
    elinesCustomerId: profile.elinesCustomerId ?? "",
    isBlacklisted: profile.isBlacklisted ?? false,
    journeyState: "",
    characteristics: profile.characteristics ?? "",
    staffNotes: profile.staffNotes ?? "",
  }
}

function buildUpdatePayload(values: EditGoldenProfileSchema): UpdateGoldenProfilePayload {
  return {
    fullName: toOptionalValue(values.fullName),
    gender: values.gender || null,
    dateOfBirth: values.dateOfBirth || null,
    primaryPhone: toOptionalValue(values.primaryPhone),
    primaryEmail: toOptionalValue(values.primaryEmail),
    address: toOptionalValue(values.address),
    city: toOptionalValue(values.city),
    memberTier: values.memberTier || null,
    loyaltyPoints: values.loyaltyPoints,
    customerType: values.customerType,
    elinesCustomerId: toOptionalValue(values.elinesCustomerId),
    isBlacklisted: values.isBlacklisted,
    journeyState: values.journeyState || null,
    characteristics: toOptionalValue(values.characteristics),
    staffNotes: toOptionalValue(values.staffNotes),
  }
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Chưa có cập nhật"

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs sm:p-5 ${className}`}>
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

export function EditCustomerDialog({ conversation, open, onOpenChange }: EditCustomerDialogProps) {
  const queryClient = useQueryClient()
  // Store đã tối giản, tạm comment syncAccountCustomerProfileName:
  // const syncAccountCustomerProfileName = useChatStore((state) => state.syncAccountCustomerProfileName)

  const goldenProfileId = conversation.accountCustomer?.goldenProfileId
  const accountCustomerId = conversation.accountCustomerId ?? null
  const provider = conversation.linkedAccount?.provider
  const displayName = getConversationDisplayName(conversation)

  const form = useForm<EditGoldenProfileSchema>({
    resolver: zodResolver(editGoldenProfileSchema),
    defaultValues: EMPTY_FORM_VALUES,
  })

  const profileQuery = useQuery({
    queryKey: ["golden-profiles", "detail", goldenProfileId],
    queryFn: () => goldenProfiles.getById(goldenProfileId!),
    enabled: open && !!goldenProfileId,
  })

  const profile = profileQuery.data?.data

  useEffect(() => {
    if (!open) return
    form.reset(buildFormValues(profile))
  }, [form, open, profile])

  const saveMutation = useMutation({
    mutationFn: ({ payload }: SaveMutationVariables) => goldenProfiles.update(goldenProfileId!, payload),
    onSuccess: (response, variables) => {
      if (goldenProfileId && response.data) {
        queryClient.setQueryData<ApiResponse<GoldenProfileDetail>>(
          ["golden-profiles", "detail", goldenProfileId],
          (current) =>
            current?.data
              ? {
                  ...current,
                  data: {
                    ...current.data,
                    ...response.data,
                  },
                }
              : current
        )
      }

      const nextFullName = response.data?.fullName ?? variables.payload.fullName ?? null

      if (accountCustomerId) {
        // Store đã tối giản, tạm comment syncAccountCustomerProfileName:
        // syncAccountCustomerProfileName({
        //   accountCustomerId,
        //   previousFullName: variables.previousFullName,
        //   nextFullName,
        // })
        void accountCustomerId
        void nextFullName
      }

      void queryClient.invalidateQueries({ queryKey: ["conversations", "detail", conversation.id] })
      void queryClient.invalidateQueries({ queryKey: ["conversations", "list"] })
      void queryClient.invalidateQueries({ queryKey: ["messages", "list", conversation.id] })

      toast.success(response.message)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật hồ sơ khách hàng.")
    },
  })

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (saveMutation.isPending) return
    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: EditGoldenProfileSchema) => {
    if (!goldenProfileId) {
      toast.error("Khách hàng này chưa có hồ sơ để chỉnh sửa.")
      return
    }

    saveMutation.mutate({
      payload: buildUpdatePayload(values),
      previousFullName: profile?.fullName ?? conversation.accountCustomer?.name ?? conversation.name ?? null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[100dvh] w-screen max-w-screen rounded-none p-0 sm:h-auto sm:max-h-[92dvh] sm:w-[min(96vw,72rem)] sm:max-w-5xl sm:rounded-2xl"
      >
        <ScrollArea className="max-h-[92dvh] rounded-none sm:rounded-2xl">
          <div className="flex h-full flex-col">
            <div className="sticky top-0 z-10 border-b border-border/70 bg-card px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <ConversationAvatar
                    id={conversation.id}
                    name={displayName}
                    provider={provider}
                    className="size-14"
                    avatarUrl={conversation.avatarUrl}
                  />

                  <DialogHeader className="min-w-0 space-y-1">
                    <DialogTitle className="line-clamp-1 text-base sm:text-lg">Chỉnh sửa hồ sơ khách hàng</DialogTitle>
                    <DialogDescription className="line-clamp-2">
                      Cập nhật thông tin Golden Profile cho khách hàng hiện tại.
                    </DialogDescription>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="secondary" className="text-[10px] font-medium sm:text-[11px]">
                        {profile?.fullName ||
                          conversation.accountCustomer?.name ||
                          displayName ||
                          FALLBACK_CUSTOMER_NAME}
                      </Badge>
                      {provider && (
                        <Badge variant="outline" className="text-[10px] font-normal sm:text-[11px]">
                          {getProviderLabel(provider)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] font-normal sm:text-[11px]">
                        Cập nhật: {formatUpdatedAt(profile?.updatedAt ?? null)}
                      </Badge>
                    </div>
                  </DialogHeader>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={saveMutation.isPending}
                >
                  <Icons.x className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              {!goldenProfileId ? (
                <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
                  <Icons.user className="mb-3 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Khách hàng này chưa có Golden Profile</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Hệ thống chưa liên kết được hồ sơ khách hàng để chỉnh sửa từ cuộc hội thoại này.
                  </p>
                </div>
              ) : profileQuery.isLoading ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-border/70 bg-card/60 p-5">
                      <div className="mb-5 h-4 w-40 animate-pulse rounded bg-muted" />
                      <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((__, fieldIndex) => (
                          <div key={fieldIndex} className="space-y-2">
                            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-9 animate-pulse rounded-lg bg-muted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : profileQuery.isError ? (
                <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 text-center">
                  <Icons.alertCircle className="mb-3 size-10 text-destructive" />
                  <p className="text-sm font-semibold text-foreground">Không thể tải hồ sơ khách hàng</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {(profileQuery.error as { message?: string })?.message ?? "Vui lòng thử lại sau ít phút."}
                  </p>
                  <Button type="button" variant="outline" className="mt-4" onClick={() => profileQuery.refetch()}>
                    <Icons.refreshCw className="size-4" />
                    Tải lại
                  </Button>
                </div>
              ) : (
                <form id="edit-customer-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <SectionCard
                      title="Thông tin cơ bản"
                      description="Các trường nhận diện chính của hồ sơ khách hàng."
                    >
                      <FieldGroup className="gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field data-invalid={!!form.formState.errors.fullName}>
                            <FieldLabel htmlFor="fullName">Họ và tên</FieldLabel>
                            <Input
                              id="fullName"
                              placeholder="Ví dụ: Nguyễn Minh Anh"
                              aria-invalid={!!form.formState.errors.fullName}
                              {...form.register("fullName")}
                            />
                            <FieldError errors={[form.formState.errors.fullName]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.gender}>
                            <FieldLabel htmlFor="gender">Giới tính</FieldLabel>
                            <Controller
                              name="gender"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <>
                                  <Select
                                    value={field.value || UNSET_SELECT_VALUE}
                                    onValueChange={(value) => field.onChange(value === UNSET_SELECT_VALUE ? "" : value)}
                                  >
                                    <SelectTrigger id="gender" className="w-full" aria-invalid={fieldState.invalid}>
                                      <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={UNSET_SELECT_VALUE}>Chưa xác định</SelectItem>
                                      {GENDER_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.dateOfBirth}>
                            <FieldLabel htmlFor="dateOfBirth">Ngày sinh</FieldLabel>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              aria-invalid={!!form.formState.errors.dateOfBirth}
                              {...form.register("dateOfBirth")}
                            />
                            <FieldError errors={[form.formState.errors.dateOfBirth]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.customerType}>
                            <FieldLabel htmlFor="customerType">Loại khách hàng</FieldLabel>
                            <Controller
                              name="customerType"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger
                                      id="customerType"
                                      className="w-full"
                                      aria-invalid={fieldState.invalid}
                                    >
                                      <SelectValue placeholder="Chọn loại khách hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CUSTOMER_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </Field>
                        </div>
                      </FieldGroup>
                    </SectionCard>

                    <SectionCard
                      title="Liên hệ và địa chỉ"
                      description="Thông tin để đội vận hành liên hệ hoặc chăm sóc khách hàng."
                    >
                      <FieldGroup className="gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field data-invalid={!!form.formState.errors.primaryPhone}>
                            <FieldLabel htmlFor="primaryPhone">Số điện thoại</FieldLabel>
                            <Input
                              id="primaryPhone"
                              placeholder="Ví dụ: 0901234567"
                              aria-invalid={!!form.formState.errors.primaryPhone}
                              {...form.register("primaryPhone")}
                            />
                            <FieldError errors={[form.formState.errors.primaryPhone]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.primaryEmail}>
                            <FieldLabel htmlFor="primaryEmail">Email</FieldLabel>
                            <Input
                              id="primaryEmail"
                              type="email"
                              placeholder="tenkhachhang@email.com"
                              aria-invalid={!!form.formState.errors.primaryEmail}
                              {...form.register("primaryEmail")}
                            />
                            <FieldError errors={[form.formState.errors.primaryEmail]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.city}>
                            <FieldLabel htmlFor="city">Tỉnh/Thành phố</FieldLabel>
                            <Input
                              id="city"
                              placeholder="Hồ Chí Minh"
                              aria-invalid={!!form.formState.errors.city}
                              {...form.register("city")}
                            />
                            <FieldError errors={[form.formState.errors.city]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.address} className="sm:col-span-2">
                            <FieldLabel htmlFor="address">Địa chỉ chi tiết</FieldLabel>
                            <Textarea
                              id="address"
                              rows={3}
                              placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                              aria-invalid={!!form.formState.errors.address}
                              {...form.register("address")}
                            />
                            <FieldError errors={[form.formState.errors.address]} />
                          </Field>
                        </div>
                      </FieldGroup>
                    </SectionCard>

                    <SectionCard
                      title="Phân loại và trạng thái"
                      description="Nhóm trường phục vụ chăm sóc, vận hành và theo dõi hành trình khách hàng."
                      className="xl:col-span-2"
                    >
                      <FieldGroup className="gap-4">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <Field data-invalid={!!form.formState.errors.memberTier}>
                            <FieldLabel htmlFor="memberTier">Hạng thành viên</FieldLabel>
                            <Controller
                              name="memberTier"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <>
                                  <Select
                                    value={field.value || UNSET_SELECT_VALUE}
                                    onValueChange={(value) => field.onChange(value === UNSET_SELECT_VALUE ? "" : value)}
                                  >
                                    <SelectTrigger id="memberTier" className="w-full" aria-invalid={fieldState.invalid}>
                                      <SelectValue placeholder="Chọn hạng thành viên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={UNSET_SELECT_VALUE}>Chưa phân hạng</SelectItem>
                                      {MEMBER_TIER_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.loyaltyPoints}>
                            <FieldLabel htmlFor="loyaltyPoints">Điểm tích lũy</FieldLabel>
                            <Controller
                              name="loyaltyPoints"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <>
                                  <Input
                                    id="loyaltyPoints"
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={field.value}
                                    onChange={(event) => {
                                      const nextValue = event.target.value
                                      field.onChange(nextValue === "" ? 0 : Number(nextValue))
                                    }}
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.journeyState}>
                            <FieldLabel htmlFor="journeyState">Trạng thái hành trình</FieldLabel>
                            <Controller
                              name="journeyState"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <>
                                  <Select
                                    value={field.value || UNSET_SELECT_VALUE}
                                    onValueChange={(value) => field.onChange(value === UNSET_SELECT_VALUE ? "" : value)}
                                  >
                                    <SelectTrigger
                                      id="journeyState"
                                      className="w-full"
                                      aria-invalid={fieldState.invalid}
                                    >
                                      <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={UNSET_SELECT_VALUE}>Chưa thiết lập</SelectItem>
                                      {JOURNEY_STATE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.elinesCustomerId}>
                            <FieldLabel htmlFor="elinesCustomerId">Mã khách hàng eLines</FieldLabel>
                            <Input
                              id="elinesCustomerId"
                              placeholder="Ví dụ: EL-203948"
                              aria-invalid={!!form.formState.errors.elinesCustomerId}
                              {...form.register("elinesCustomerId")}
                            />
                            <FieldError errors={[form.formState.errors.elinesCustomerId]} />
                          </Field>

                          <div className="sm:col-span-2 xl:col-span-2">
                            <Controller
                              name="isBlacklisted"
                              control={form.control}
                              render={({ field }) => (
                                <Field
                                  orientation="horizontal"
                                  className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"
                                >
                                  <Checkbox
                                    id="isBlacklisted"
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                  />
                                  <FieldContent>
                                    <FieldTitle>Đánh dấu cần lưu ý</FieldTitle>
                                    <FieldDescription>
                                      Bật tùy chọn này nếu khách hàng cần đội ngũ hỗ trợ xử lý cẩn trọng hơn trong các
                                      lần chăm sóc tiếp theo.
                                    </FieldDescription>
                                  </FieldContent>
                                </Field>
                              )}
                            />
                          </div>
                        </div>
                      </FieldGroup>
                    </SectionCard>

                    <SectionCard
                      title="Chân dung và ghi chú nội bộ"
                      description="Ghi lại đặc điểm nhận diện, sở thích hoặc lưu ý quan trọng cho đội chăm sóc."
                      className="xl:col-span-2"
                    >
                      <FieldGroup className="gap-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <Field data-invalid={!!form.formState.errors.characteristics}>
                            <FieldLabel htmlFor="characteristics">Đặc điểm khách hàng</FieldLabel>
                            <Textarea
                              id="characteristics"
                              rows={5}
                              placeholder="Ví dụ: thích phản hồi nhanh, ưu tiên gói linh hoạt, thường đi công tác..."
                              aria-invalid={!!form.formState.errors.characteristics}
                              {...form.register("characteristics")}
                            />
                            <FieldError errors={[form.formState.errors.characteristics]} />
                          </Field>

                          <Field data-invalid={!!form.formState.errors.staffNotes}>
                            <FieldLabel htmlFor="staffNotes">Ghi chú nội bộ</FieldLabel>
                            <Textarea
                              id="staffNotes"
                              rows={5}
                              placeholder="Thông tin chỉ dành cho đội nội bộ..."
                              aria-invalid={!!form.formState.errors.staffNotes}
                              {...form.register("staffNotes")}
                            />
                            <FieldError errors={[form.formState.errors.staffNotes]} />
                          </Field>
                        </div>
                      </FieldGroup>
                    </SectionCard>
                  </div>
                </form>
              )}
            </div>

            <div className="border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {profile?.accountCustomers?.length
                    ? `Hồ sơ này đang liên kết với ${profile.accountCustomers.length} tài khoản khách hàng.`
                    : "Thông tin thay đổi sẽ áp dụng cho hồ sơ khách hàng hiện tại."}
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    disabled={saveMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    form="edit-customer-form"
                    disabled={!goldenProfileId || profileQuery.isLoading || saveMutation.isPending}
                  >
                    {saveMutation.isPending && <Icons.spinner className="size-4 animate-spin" />}
                    Lưu hồ sơ khách hàng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
