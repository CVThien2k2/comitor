"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/sonner"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { ROUTES } from "@/lib/routes"
import { auth } from "@/api/auth"
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/schema/auth"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const resetMutation = useMutation({
    mutationFn: auth.resetPassword,
    onSuccess: (res) => {
      toast.success(res.message)
      setIsSuccess(true)
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau.")
    },
  })

  const onSubmit = (values: ResetPasswordSchema) => {
    resetMutation.mutate({ token, password: values.password })
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full">
              <Icons.checkCircle className="h-8 w-8 text-(--color-success)" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Đặt lại mật khẩu thành công!</h3>
              <p className="text-sm text-muted-foreground">
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
              </p>
            </div>
            <Button className="w-full" asChild>
              <Link href={ROUTES["sign-in"].path}>Đăng nhập</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 p-2 text-center">
        <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
        <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
                  <div className="relative">
                    <Icons.lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      aria-invalid={fieldState.invalid}
                      className="pr-10 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                  <div className="relative">
                    <Icons.lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      aria-invalid={fieldState.invalid}
                      className="pr-10 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirmPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              {resetMutation.isPending ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Đặt lại mật khẩu"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href={ROUTES["sign-in"].path}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icons.arrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </CardFooter>
    </Card>
  )
}
