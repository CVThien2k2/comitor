"use client"

import { goldenProfiles, type GoldenProfileDetail } from "@/api"
import { Icons } from "@/components/global/icons"
import { editGoldenProfileSchema, type EditGoldenProfileSchema } from "@/lib/schema/golden-profile"
import type { UpdateGoldenProfilePayload } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { useEffect, type ReactNode } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "@workspace/ui/components/sonner"
import { Textarea } from "@workspace/ui/components/textarea"

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
  { value: "individual", label: "Khách cá nhân" },
  { value: "business", label: "Khách doanh nghiệp" },
  { value: "agent", label: "Khách đại lý" },
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
  { value: "completed", label: "Đã hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
] as const

const UNSET_SELECT_VALUE = "__unset__"

type ProfileDetailFormProps = {
  profileId: string
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
    journeyState: profile.journeyState ?? "",
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

export function ProfileDetailForm({ profileId }: ProfileDetailFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<EditGoldenProfileSchema>({
    resolver: zodResolver(editGoldenProfileSchema),
    defaultValues: EMPTY_FORM_VALUES,
  })

  const detailQuery = useSuspenseQuery({
    queryKey: ["golden-profiles", "detail", profileId],
    queryFn: () => goldenProfiles.getById(profileId),
  })

  const profile = detailQuery.data?.data

  useEffect(() => {
    if (!profile) return
    form.reset(buildFormValues(profile))
  }, [form, profile])

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateGoldenProfilePayload) => goldenProfiles.update(profileId, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["golden-profiles", "detail", profileId] })
      void queryClient.invalidateQueries({ queryKey: ["golden-profiles", "list"] })
      toast.success(response.message || "Cập nhật hồ sơ thành công")
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể cập nhật hồ sơ khách hàng.")
    },
  })

  const onSubmit = (values: EditGoldenProfileSchema) => {
    saveMutation.mutate(buildUpdatePayload(values))
  }

  if (detailQuery.isError || !profile) {
    return (
      <Card className="py-3">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3">
          <Icons.alertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-foreground">Không thể tải chi tiết hồ sơ</p>
          <p className="text-sm text-muted-foreground">
            {(detailQuery.error as { message?: string })?.message ?? "Vui lòng thử lại sau."}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
              Tải lại
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link href="/golden-profiles">Quay lại danh sách</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="py-3">
        <CardHeader className="px-4 pb-0 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Chi tiết hồ sơ khách hàng</CardTitle>
              <p className="text-sm text-muted-foreground">Chỉnh sửa thông tin và lưu thay đổi trực tiếp trên trang.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{profile.fullName || "Chưa cập nhật họ tên"}</Badge>
              <Badge variant="outline">Mã hồ sơ: {profile.id}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard title="Thông tin cơ bản" description="Các trường nhận diện chính của hồ sơ khách hàng.">
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
                              <SelectTrigger id="customerType" className="w-full" aria-invalid={fieldState.invalid}>
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
                              <SelectTrigger id="journeyState" className="w-full" aria-invalid={fieldState.invalid}>
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
                                Bật tùy chọn này nếu khách hàng cần đội ngũ hỗ trợ xử lý cẩn trọng hơn trong các lần
                                chăm sóc tiếp theo.
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
                        placeholder="Ví dụ: thích phản hồi nhanh, ưu tiên gói linh hoạt..."
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

            <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-between">
              <Button asChild type="button" variant="outline">
                <Link href="/golden-profiles">Quay lại danh sách</Link>
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Icons.spinner className="size-4 animate-spin" />}
                Lưu hồ sơ khách hàng
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function SkeletonField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

function SkeletonSection({ className = "" }: { className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs sm:p-5 ${className}`}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
      </div>
    </section>
  )
}

export function ProfileDetailFormSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="py-3">
        <CardHeader className="px-4 pb-0 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-6 w-52 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <SkeletonSection />
              <SkeletonSection />
              <SkeletonSection className="xl:col-span-2" />
              <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs sm:p-5 xl:col-span-2">
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                  </div>
                </div>
              </section>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-between">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-44 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
