"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/sonner"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { ROUTES } from "@/lib/routes"
import { AUTH_POST_LOGOUT_TOAST_KEY } from "@/lib/constants/auth"
import { useAuthStore } from "@/stores/auth-store"
import { auth } from "@/api/auth"
import { loginSchema, type LoginSchema } from "@/lib/schema/auth"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  useEffect(() => {
    const logoutMessage = sessionStorage.getItem(AUTH_POST_LOGOUT_TOAST_KEY)
    if (!logoutMessage) return

    sessionStorage.removeItem(AUTH_POST_LOGOUT_TOAST_KEY)
    toast.success(logoutMessage)
  }, [])

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.accessToken, res.data.user)
        toast.success(res.message)
        router.push("/")
      }
    },
    onError: (error) => {
      toast.error((error as { message?: string })?.message ?? "Không thể kết nối đến server. Vui lòng thử lại.")
    },
  })

  const onSubmit = (values: LoginSchema) => {
    loginMutation.mutate(values)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
        <CardDescription>Nhập thông tin để truy cập hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                  <div className="relative">
                    <Icons.mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="username"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      aria-invalid={fieldState.invalid}
                      className="pl-10"
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <Link
                      href={ROUTES["forgot-password"].path}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Icons.lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
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

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Đăng nhập"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
